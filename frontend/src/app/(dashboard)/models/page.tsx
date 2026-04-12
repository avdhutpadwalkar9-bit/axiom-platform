"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Model {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  period_count: number;
  updated_at: string;
}

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStartDate, setNewStartDate] = useState(
    new Date().toISOString().split("T")[0].slice(0, 7) + "-01"
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await api.listModels();
      setModels(data);
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const model = await api.createModel({
        name: newName,
        start_date: newStartDate,
        period_count: 36,
      });
      router.push(`/models/${model.id}`);
    } catch (err) {
      console.error("Failed to create model:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await api.deleteModel(id);
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete model:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Models</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage your financial models
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New Model</Button>
      </div>

      {showCreate && (
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create New Model</h2>
          <form onSubmit={handleCreate} className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., 2024 SaaS P&L"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mb-2 text-lg font-medium text-gray-900">
            No models yet
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Create your first financial model to get started
          </p>
          <Button onClick={() => setShowCreate(true)}>Create Model</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => router.push(`/models/${model.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  {model.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {model.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(model.id);
                  }}
                  className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Starts: {model.start_date}</span>
                <span>{model.period_count} months</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Updated: {new Date(model.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
