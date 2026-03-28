"use client";

import React from "react";

export type Column<T> = {
  key: string;
  label: string;
  width?: string;
  render: (item: T) => React.ReactNode;
};

type StudioTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  onRowClick?: (item: T) => void;
};

export default function StudioTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  onRowClick,
}: StudioTableProps<T>) {
  const allKeys = data.map((item) => rowKey(item));
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));

  function handleSelectAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allKeys));
    }
  }

  function handleSelectOne(key: string) {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textAlign: "left",
    borderBottom: "1px solid var(--line)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid var(--line2)",
  };

  if (data.length === 0) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ ...thStyle, width: 40 }}>
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    style={{ accentColor: "var(--accent)" }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} style={{ ...thStyle, width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: "40px 12px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...thStyle, width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  style={{ accentColor: "var(--accent)" }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} style={{ ...thStyle, width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const key = rowKey(item);
            const isSelected = selectedKeys.has(key);

            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(item)}
                style={{
                  cursor: onRowClick ? "pointer" : undefined,
                  background: isSelected ? "rgba(139,92,246,.06)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected
                    ? "rgba(139,92,246,.06)"
                    : "";
                }}
              >
                {selectable && (
                  <td style={{ ...tdStyle, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(key)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: "var(--accent)" }}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} style={{ ...tdStyle, width: col.width }}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
