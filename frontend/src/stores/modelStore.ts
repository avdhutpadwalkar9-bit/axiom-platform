import { create } from "zustand";
import { api } from "@/lib/api";
import { computeModel } from "@/lib/formula";

interface Variable {
  id: string;
  slug: string;
  name: string;
  section_id: string | null;
  variable_type: string;
  data_type: string;
  formula: string | null;
  default_value: number | null;
  sort_order: number;
}

interface Section {
  id: string;
  name: string;
  section_type: string | null;
  sort_order: number;
  statement: string | null;
}

interface Scenario {
  id: string;
  name: string;
  is_base: boolean;
  color: string | null;
}

interface ModelMeta {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  period_count: number;
}

interface ModelState {
  model: ModelMeta | null;
  sections: Section[];
  variables: Variable[];
  scenarios: Scenario[];
  activeScenarioId: string | null;
  computedValues: Record<string, Record<number, number>>;
  cellOverrides: Record<string, Record<number, number>>;
  isDirty: boolean;
  isLoading: boolean;

  loadModel: (modelId: string) => Promise<void>;
  updateCell: (variableId: string, periodIndex: number, value: number) => void;
  saveChanges: () => Promise<void>;
  addVariable: (
    modelId: string,
    data: {
      name: string;
      section_id?: string;
      variable_type?: string;
      data_type?: string;
      formula?: string;
      default_value?: number;
    }
  ) => Promise<void>;
  deleteVariable: (variableId: string) => Promise<void>;
  recompute: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  sections: [],
  variables: [],
  scenarios: [],
  activeScenarioId: null,
  computedValues: {},
  cellOverrides: {},
  isDirty: false,
  isLoading: false,

  loadModel: async (modelId: string) => {
    set({ isLoading: true });
    try {
      const [model, sections, variables, scenarios] = await Promise.all([
        api.getModel(modelId),
        api.listSections(modelId),
        api.listVariables(modelId),
        api.listScenarios(modelId),
      ]);

      const baseScenario = scenarios.find((s) => s.is_base) || scenarios[0];
      const scenarioId = baseScenario?.id || null;

      // Load computed values from server
      let computedValues: Record<string, Record<number, number>> = {};
      let cellOverrides: Record<string, Record<number, number>> = {};
      if (scenarioId) {
        const result = await api.compute(modelId, scenarioId);
        computedValues = result.values;
        // For input variables, their values in computedValues are the overrides
        for (const v of variables) {
          if (v.variable_type === "input") {
            const vals = computedValues[v.id];
            if (vals) {
              cellOverrides[v.id] = { ...vals };
            }
          }
        }
      }

      set({
        model: model as ModelMeta,
        sections: sections as Section[],
        variables: variables as Variable[],
        scenarios: scenarios as Scenario[],
        activeScenarioId: scenarioId,
        computedValues,
        cellOverrides,
        isDirty: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load model:", error);
      set({ isLoading: false });
    }
  },

  updateCell: (variableId: string, periodIndex: number, value: number) => {
    const { cellOverrides } = get();
    const newOverrides = { ...cellOverrides };
    if (!newOverrides[variableId]) newOverrides[variableId] = {};
    newOverrides[variableId] = {
      ...newOverrides[variableId],
      [periodIndex]: value,
    };
    set({ cellOverrides: newOverrides, isDirty: true });
    get().recompute();
  },

  recompute: () => {
    const { variables, cellOverrides, model } = get();
    if (!model) return;
    const computed = computeModel(variables, cellOverrides, model.period_count);
    set({ computedValues: computed });
  },

  saveChanges: async () => {
    const { cellOverrides, activeScenarioId, variables } = get();
    if (!activeScenarioId) return;

    const updates: Array<{
      variable_id: string;
      scenario_id: string;
      period_index: number;
      value: number | null;
    }> = [];

    for (const v of variables) {
      if (v.variable_type === "input") {
        const overrides = cellOverrides[v.id];
        if (overrides) {
          for (const [period, value] of Object.entries(overrides)) {
            updates.push({
              variable_id: v.id,
              scenario_id: activeScenarioId,
              period_index: parseInt(period),
              value,
            });
          }
        }
      }
    }

    if (updates.length > 0) {
      await api.bulkUpdateCells(updates);
    }
    set({ isDirty: false });
  },

  addVariable: async (modelId, data) => {
    await api.createVariable(modelId, data);
    // Reload
    await get().loadModel(modelId);
  },

  deleteVariable: async (variableId: string) => {
    const { model } = get();
    await api.deleteVariable(variableId);
    if (model) await get().loadModel(model.id);
  },
}));
