"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useModelStore } from "@/stores/modelStore";
import { ModelGrid } from "@/components/grid/ModelGrid";
import { AddVariableDialog } from "@/components/model/AddVariableDialog";
import { Button } from "@/components/ui/button";
import { format, addMonths, parseISO } from "date-fns";

export default function ModelEditorPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = use(params);
  const router = useRouter();
  const {
    model,
    sections,
    variables,
    scenarios,
    activeScenarioId,
    computedValues,
    isLoading,
    isDirty,
    loadModel,
    saveChanges,
    updateCell,
    addVariable,
    deleteVariable,
  } = useModelStore();

  const [showAddVariable, setShowAddVariable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadModel(modelId);
  }, [modelId, loadModel]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveChanges();
    } finally {
      setSaving(false);
    }
  };

  const getPeriodLabels = (): string[] => {
    if (!model) return [];
    const start = parseISO(model.start_date);
    return Array.from({ length: model.period_count }, (_, i) =>
      format(addMonths(start, i), "MMM yyyy")
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading model...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Model not found</div>
      </div>
    );
  }

  const periodLabels = getPeriodLabels();

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/models")}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{model.name}</h1>
          {isDirty && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {scenarios.length > 0 && (
            <select
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              value={activeScenarioId || ""}
              disabled
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowAddVariable(true)}>
            + Variable
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        {variables.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="mb-4 text-gray-500">
              No variables yet. Add your first variable to start building your model.
            </p>
            <Button onClick={() => setShowAddVariable(true)}>
              Add Variable
            </Button>
          </div>
        ) : (
          <ModelGrid
            variables={variables}
            sections={sections}
            computedValues={computedValues}
            periodLabels={periodLabels}
            onCellChange={updateCell}
            onDeleteVariable={deleteVariable}
          />
        )}
      </div>

      {showAddVariable && model && (
        <AddVariableDialog
          modelId={model.id}
          sections={sections}
          onAdd={async (data) => {
            await addVariable(model.id, data);
            setShowAddVariable(false);
          }}
          onClose={() => setShowAddVariable(false)}
        />
      )}
    </div>
  );
}
