import ast
from collections import defaultdict
from dataclasses import dataclass


class FormulaError(Exception):
    pass


class CyclicDependencyError(FormulaError):
    pass


class InvalidFormulaError(FormulaError):
    pass


ALLOWED_AST_NODES = {
    ast.Expression, ast.BinOp, ast.UnaryOp, ast.Name, ast.Call,
    ast.Compare, ast.IfExp, ast.Constant, ast.Load,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Mod, ast.FloorDiv, ast.Pow,
    ast.USub, ast.UAdd,
    ast.Gt, ast.Lt, ast.GtE, ast.LtE, ast.Eq, ast.NotEq,
    ast.BoolOp, ast.And, ast.Or, ast.Not,
}

ALLOWED_FUNCTIONS = {"prev", "min", "max", "round", "abs", "cumsum", "if_"}


@dataclass
class VariableInfo:
    id: str
    slug: str
    variable_type: str  # input, formula, summary
    formula: str | None
    default_value: float | None


def validate_formula(formula: str, known_slugs: set[str]) -> list[str]:
    """Validate formula AST and return referenced variable slugs."""
    try:
        tree = ast.parse(formula, mode="eval")
    except SyntaxError as e:
        raise InvalidFormulaError(f"Syntax error: {e}")

    refs = []
    for node in ast.walk(tree):
        node_type = type(node)
        if node_type not in ALLOWED_AST_NODES:
            raise InvalidFormulaError(f"Disallowed syntax: {node_type.__name__}")

        if isinstance(node, ast.Name) and node.id not in ALLOWED_FUNCTIONS:
            if node.id in known_slugs:
                refs.append(node.id)
            elif node.id not in ("True", "False", "None"):
                raise InvalidFormulaError(f"Unknown variable: {node.id}")

        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name not in ALLOWED_FUNCTIONS and func_name not in known_slugs:
                raise InvalidFormulaError(f"Unknown function: {func_name}")
            # Extract variable refs from prev(slug) and cumsum(slug)
            if func_name in ("prev", "cumsum") and node.args:
                if isinstance(node.args[0], ast.Name) and node.args[0].id in known_slugs:
                    refs.append(node.args[0].id)

    return list(set(refs))


def topological_sort(variables: dict[str, VariableInfo], dep_graph: dict[str, list[str]]) -> list[str]:
    """Kahn's algorithm for topological sort. Returns slugs in evaluation order."""
    in_degree = {slug: 0 for slug in dep_graph}
    reverse_graph = defaultdict(list)

    for slug, deps in dep_graph.items():
        for dep in deps:
            reverse_graph[dep].append(slug)
            in_degree[slug] = in_degree.get(slug, 0) + 1

    queue = [s for s, d in in_degree.items() if d == 0]
    result = []

    while queue:
        node = queue.pop(0)
        result.append(node)
        for dependent in reverse_graph[node]:
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)

    if len(result) != len(dep_graph):
        remaining = set(dep_graph.keys()) - set(result)
        raise CyclicDependencyError(f"Circular dependency involving: {', '.join(remaining)}")

    return result


def compute_model(
    variables: list[VariableInfo],
    cell_overrides: dict[str, dict[int, float]],  # {variable_id: {period_index: value}}
    period_count: int,
) -> dict[str, dict[int, float]]:
    """
    Compute all variable values for all periods.

    Returns: {variable_id: {period_index: computed_value}}
    """
    var_by_slug = {v.slug: v for v in variables}
    known_slugs = set(var_by_slug.keys())

    # Build dependency graph
    dep_graph: dict[str, list[str]] = {}
    for var in variables:
        if var.formula and var.variable_type == "formula":
            try:
                refs = validate_formula(var.formula, known_slugs)
            except InvalidFormulaError:
                refs = []
            dep_graph[var.slug] = refs
        else:
            dep_graph[var.slug] = []

    # Get evaluation order
    eval_order = topological_sort(var_by_slug, dep_graph)

    results: dict[str, dict[int, float]] = {}  # {variable_id: {period: value}}

    for period in range(period_count):
        for slug in eval_order:
            var = var_by_slug[slug]
            var_id = var.id

            if var.variable_type == "input" or not var.formula:
                # Use override if available, else default
                overrides = cell_overrides.get(var_id, {})
                val = overrides.get(period, var.default_value or 0)
                results.setdefault(var_id, {})[period] = float(val) if val is not None else 0.0
            else:
                # Build namespace for formula evaluation
                namespace = _build_namespace(var_by_slug, results, period)
                try:
                    val = eval(
                        compile(ast.parse(var.formula, mode="eval"), "<formula>", "eval"),
                        {"__builtins__": {}},
                        namespace,
                    )
                    results.setdefault(var_id, {})[period] = float(val) if val is not None else 0.0
                except Exception:
                    results.setdefault(var_id, {})[period] = 0.0

    return results


def _build_namespace(
    var_by_slug: dict[str, VariableInfo],
    results: dict[str, dict[int, float]],
    period: int,
) -> dict:
    """Build the eval namespace with current variable values and helper functions."""
    ns = {}

    # Map slug -> current period value
    for slug, var in var_by_slug.items():
        ns[slug] = results.get(var.id, {}).get(period, 0.0)

    # prev(slug, offset=1) - get value from a previous period
    def prev(slug_or_val, offset=1):
        if isinstance(slug_or_val, str):
            var = var_by_slug.get(slug_or_val)
            if not var:
                return 0.0
            target = period - offset
            if target < 0:
                return 0.0
            return results.get(var.id, {}).get(target, 0.0)
        # If it's already a number (variable was resolved), look it up by value match
        return 0.0

    # cumsum(slug) - cumulative sum up to current period
    def cumsum(slug_name):
        var = var_by_slug.get(slug_name)
        if not var:
            return 0.0
        total = 0.0
        for p in range(period + 1):
            total += results.get(var.id, {}).get(p, 0.0)
        return total

    # if_(condition, then_val, else_val)
    def if_(condition, then_val, else_val):
        return then_val if condition else else_val

    ns["prev"] = prev
    ns["cumsum"] = cumsum
    ns["if_"] = if_
    ns["min"] = min
    ns["max"] = max
    ns["round"] = round
    ns["abs"] = abs

    return ns
