"use client";

import { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  type ColDef,
  type CellValueChangedEvent,
  type CellClassParams,
  type ValueFormatterParams,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

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
}

interface ModelGridProps {
  variables: Variable[];
  sections: Section[];
  computedValues: Record<string, Record<number, number>>;
  periodLabels: string[];
  onCellChange: (variableId: string, periodIndex: number, value: number) => void;
  onDeleteVariable: (variableId: string) => void;
}

interface RowData {
  id: string;
  name: string;
  variable_type: string;
  data_type: string;
  formula: string | null;
  section_name: string;
  [key: `p_${number}`]: number;
}

export function ModelGrid({
  variables,
  sections,
  computedValues,
  periodLabels,
  onCellChange,
  onDeleteVariable,
}: ModelGridProps) {
  const sectionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sections) {
      map[s.id] = s.name;
    }
    return map;
  }, [sections]);

  const rowData: RowData[] = useMemo(() => {
    return variables.map((v) => {
      const row: RowData = {
        id: v.id,
        name: v.name,
        variable_type: v.variable_type,
        data_type: v.data_type,
        formula: v.formula,
        section_name: v.section_id ? sectionMap[v.section_id] || "Other" : "Other",
      };
      const values = computedValues[v.id] || {};
      for (let i = 0; i < periodLabels.length; i++) {
        row[`p_${i}`] = values[i] ?? 0;
      }
      return row;
    });
  }, [variables, computedValues, periodLabels, sectionMap]);

  const formatValue = useCallback(
    (params: ValueFormatterParams) => {
      if (params.value == null) return "";
      const row = params.data as RowData;
      const val = Number(params.value);
      if (row.data_type === "percentage") {
        return `${(val * 100).toFixed(1)}%`;
      }
      if (row.data_type === "currency") {
        return val.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
    },
    []
  );

  const columnDefs: ColDef[] = useMemo(() => {
    const cols: ColDef[] = [
      {
        field: "section_name",
        headerName: "Section",
        pinned: "left",
        width: 120,
        rowGroup: true,
        hide: true,
      },
      {
        field: "name",
        headerName: "Variable",
        pinned: "left",
        width: 200,
        cellClass: (params: CellClassParams) => {
          const row = params.data as RowData | undefined;
          if (!row) return "";
          if (row.variable_type === "formula") return "text-blue-700 italic";
          if (row.variable_type === "summary") return "font-bold";
          return "";
        },
      },
      {
        field: "formula",
        headerName: "Formula",
        pinned: "left",
        width: 160,
        cellClass: "text-gray-400 text-xs",
      },
    ];

    for (let i = 0; i < periodLabels.length; i++) {
      cols.push({
        field: `p_${i}`,
        headerName: periodLabels[i],
        width: 120,
        type: "numericColumn",
        editable: (params) => {
          const row = params.data as RowData | undefined;
          return row?.variable_type === "input";
        },
        valueFormatter: formatValue,
        cellClass: (params: CellClassParams) => {
          const val = Number(params.value);
          if (val < 0) return "text-red-600";
          return "";
        },
      });
    }

    return cols;
  }, [periodLabels, formatValue]);

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      const row = event.data as RowData;
      const field = event.colDef.field;
      if (!field?.startsWith("p_")) return;
      const periodIndex = parseInt(field.substring(2));
      const value = parseFloat(event.newValue) || 0;
      onCellChange(row.id, periodIndex, value);
    },
    [onCellChange]
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="h-full w-full">
      <AgGridReact
        theme={themeAlpine}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        animateRows={false}
        groupDisplayType="groupRows"
        getRowId={(params) => params.data.id}
      />
    </div>
  );
}
