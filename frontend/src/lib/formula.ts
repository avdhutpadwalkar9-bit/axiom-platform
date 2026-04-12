import { create, all, MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});

export function computeModel(
  variables: Array<{
    id: string;
    slug: string;
    variable_type: string;
    formula: string | null;
    default_value: number | null;
  }>,
  cellOverrides: Record<string, Record<number, number>>,
  periodCount: number
): Record<string, Record<number, number>> {
  const varBySlug = new Map(variables.map((v) => [v.slug, v]));
  const knownSlugs = new Set(variables.map((v) => v.slug));

  // Build dependency graph
  const depGraph = new Map<string, string[]>();
  for (const v of variables) {
    if (v.formula && v.variable_type === "formula") {
      const refs = extractReferences(v.formula, knownSlugs);
      depGraph.set(v.slug, refs);
    } else {
      depGraph.set(v.slug, []);
    }
  }

  // Topological sort
  const order = topologicalSort(depGraph);

  const results: Record<string, Record<number, number>> = {};

  for (let period = 0; period < periodCount; period++) {
    for (const slug of order) {
      const v = varBySlug.get(slug)!;
      if (v.variable_type === "input" || !v.formula) {
        const overrides = cellOverrides[v.id] || {};
        const val = overrides[period] ?? v.default_value ?? 0;
        if (!results[v.id]) results[v.id] = {};
        results[v.id][period] = val;
      } else {
        // Build scope
        const scope: Record<string, unknown> = {};
        for (const [s, sv] of varBySlug) {
          scope[s] = results[sv.id]?.[period] ?? 0;
        }
        // prev function
        scope["prev"] = (slugName: string, offset: number = 1) => {
          const target = period - offset;
          if (target < 0) return 0;
          const refVar = varBySlug.get(slugName);
          if (!refVar) return 0;
          return results[refVar.id]?.[target] ?? 0;
        };
        scope["cumsum"] = (slugName: string) => {
          const refVar = varBySlug.get(slugName);
          if (!refVar) return 0;
          let total = 0;
          for (let p = 0; p <= period; p++) {
            total += results[refVar.id]?.[p] ?? 0;
          }
          return total;
        };
        scope["if_"] = (cond: boolean, a: number, b: number) =>
          cond ? a : b;

        try {
          const val = math.evaluate(v.formula, scope);
          if (!results[v.id]) results[v.id] = {};
          results[v.id][period] = typeof val === "number" ? val : 0;
        } catch {
          if (!results[v.id]) results[v.id] = {};
          results[v.id][period] = 0;
        }
      }
    }
  }

  return results;
}

function extractReferences(
  formula: string,
  knownSlugs: Set<string>
): string[] {
  const refs: string[] = [];
  // Match word tokens that are known slugs
  const tokens = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  for (const token of tokens) {
    if (
      knownSlugs.has(token) &&
      !["prev", "cumsum", "if_", "min", "max", "round", "abs"].includes(token)
    ) {
      refs.push(token);
    }
  }
  // Also check prev(slug) and cumsum(slug)
  const funcRefs =
    formula.match(/(?:prev|cumsum)\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
  for (const match of funcRefs) {
    const inner = match.match(/\(\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (inner && knownSlugs.has(inner[1])) {
      refs.push(inner[1]);
    }
  }
  return [...new Set(refs)];
}

function topologicalSort(depGraph: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>();
  const reverseGraph = new Map<string, string[]>();

  for (const slug of depGraph.keys()) {
    inDegree.set(slug, 0);
    reverseGraph.set(slug, []);
  }

  for (const [slug, deps] of depGraph) {
    for (const dep of deps) {
      if (inDegree.has(dep)) {
        inDegree.set(slug, (inDegree.get(slug) || 0) + 1);
        reverseGraph.get(dep)!.push(slug);
      }
    }
  }

  const queue: string[] = [];
  for (const [slug, deg] of inDegree) {
    if (deg === 0) queue.push(slug);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const dependent of reverseGraph.get(node) || []) {
      const newDeg = (inDegree.get(dependent) || 1) - 1;
      inDegree.set(dependent, newDeg);
      if (newDeg === 0) queue.push(dependent);
    }
  }

  return result;
}
