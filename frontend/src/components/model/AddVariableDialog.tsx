"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Section {
  id: string;
  name: string;
}

interface AddVariableDialogProps {
  modelId: string;
  sections: Section[];
  onAdd: (data: {
    name: string;
    section_id?: string;
    variable_type?: string;
    data_type?: string;
    formula?: string;
    default_value?: number;
  }) => Promise<void>;
  onClose: () => void;
}

export function AddVariableDialog({
  sections,
  onAdd,
  onClose,
}: AddVariableDialogProps) {
  const [name, setName] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [variableType, setVariableType] = useState("input");
  const [dataType, setDataType] = useState("currency");
  const [formula, setFormula] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        name,
        section_id: sectionId || undefined,
        variable_type: variableType,
        data_type: dataType,
        formula: variableType === "formula" ? formula : undefined,
        default_value: defaultValue ? parseFloat(defaultValue) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Add Variable</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="var-name">Name</Label>
            <Input
              id="var-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Revenue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="var-type">Type</Label>
              <select
                id="var-type"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={variableType}
                onChange={(e) => setVariableType(e.target.value)}
              >
                <option value="input">Input (manual)</option>
                <option value="formula">Formula (computed)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-type">Format</Label>
              <select
                id="data-type"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="currency">Currency ($)</option>
                <option value="number">Number</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>

          {sections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <select
                id="section"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              >
                <option value="">No section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {variableType === "formula" && (
            <div className="space-y-2">
              <Label htmlFor="formula">Formula</Label>
              <Input
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., users * arpu"
              />
              <p className="text-xs text-gray-500">
                Use variable slugs. Available functions: prev(), min(), max(), round(), abs()
              </p>
            </div>
          )}

          {variableType === "input" && (
            <div className="space-y-2">
              <Label htmlFor="default-value">Default Value</Label>
              <Input
                id="default-value"
                type="number"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Variable"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
