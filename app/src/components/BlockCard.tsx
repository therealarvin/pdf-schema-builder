"use client";

import React, { useState } from "react";
import { SchemaItem } from "@/types/schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Block {
  name: string;
  title?: string;
  description?: string;
  color_theme?: "blue" | "green" | "purple" | "orange" | "gray";
  items: SchemaItem[];
}

interface BlockCardProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onRemoveItem: (itemId: string) => void;
  selectedItems: Set<string>;
  onToggleItemSelection: (itemId: string) => void;
  onSelectAll: () => void;
}

export default function BlockCard({
  block,
  onUpdate,
  onDelete,
  onRemoveItem,
  selectedItems,
  onToggleItemSelection,
  onSelectAll
}: BlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(block.title || block.name);
  const [editedDescription, setEditedDescription] = useState(block.description || "");
  const [editedColor, setEditedColor] = useState(block.color_theme || "gray");
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    onUpdate({
      title: editedTitle,
      description: editedDescription,
      color_theme: editedColor
    });
    setIsEditing(false);
  };

  const getColorStyles = (theme: string) => {
    switch (theme) {
      case "blue":
        return {
          background: "#eff6ff",
          borderColor: "#2563eb",
          titleColor: "#1e40af",
          badgeBackground: "#dbeafe",
          badgeColor: "#1e40af"
        };
      case "green":
        return {
          background: "#f0fdf4",
          borderColor: "#10b981",
          titleColor: "#047857",
          badgeBackground: "#d1fae5",
          badgeColor: "#047857"
        };
      case "purple":
        return {
          background: "#faf5ff",
          borderColor: "#8b5cf6",
          titleColor: "#6b21a8",
          badgeBackground: "#e9d5ff",
          badgeColor: "#6b21a8"
        };
      case "orange":
        return {
          background: "#fff7ed",
          borderColor: "#f97316",
          titleColor: "#c2410c",
          badgeBackground: "#fed7aa",
          badgeColor: "#c2410c"
        };
      default:
        return {
          background: "#f9fafb",
          borderColor: "#6b7280",
          titleColor: "#374151",
          badgeBackground: "#e5e7eb",
          badgeColor: "#374151"
        };
    }
  };

  const colors = getColorStyles(block.color_theme || "gray");

  // Count items by type
  const typeCounts = block.items.reduce((acc, item) => {
    const type = item.display_attributes.input_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: "16px",
        border: `2px solid ${colors.borderColor}`,
        borderRadius: "8px",
        overflow: "hidden"
      }}
      {...attributes}
    >
      {/* Block Header */}
      <div
        style={{
          padding: "12px 16px",
          background: colors.background,
          borderBottom: `1px solid ${colors.borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          {/* Drag Handle */}
          <div
            {...listeners}
            style={{
              cursor: "grab",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
            title="Drag to reorder blocks"
          >
            <div style={{ width: "16px", height: "2px", background: colors.titleColor }} />
            <div style={{ width: "16px", height: "2px", background: colors.titleColor }} />
            <div style={{ width: "16px", height: "2px", background: colors.titleColor }} />
          </div>

          {isEditing ? (
            <div style={{ display: "flex", gap: "8px", flex: 1 }}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Block title"
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "600"
                }}
              />
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Description (optional)"
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  flex: 1
                }}
              />
              <select
                value={editedColor}
                onChange={(e) => setEditedColor(e.target.value as "blue" | "green" | "purple" | "orange" | "gray")}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <option value="blue">🔵 Blue</option>
                <option value="green">🟢 Green</option>
                <option value="purple">🟣 Purple</option>
                <option value="orange">🟠 Orange</option>
                <option value="gray">⚫ Gray</option>
              </select>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "4px 12px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(block.title || block.name);
                  setEditedDescription(block.description || "");
                  setEditedColor(block.color_theme || "gray");
                }}
                style={{
                  padding: "4px 12px",
                  background: "white",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "16px", 
                  fontWeight: "600",
                  color: colors.titleColor
                }}>
                  {block.title || block.name}
                </h3>
                {block.description && (
                  <p style={{ 
                    margin: "4px 0 0 0", 
                    fontSize: "13px", 
                    color: "#6b7280" 
                  }}>
                    {block.description}
                  </p>
                )}
              </div>
              
              {/* Item count badges */}
              <div style={{ display: "flex", gap: "6px", marginRight: "12px" }}>
                <span style={{
                  padding: "2px 8px",
                  background: colors.badgeBackground,
                  color: colors.badgeColor,
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {block.items.length} items
                </span>
                {Object.entries(typeCounts).map(([type, count]) => (
                  <span
                    key={type}
                    style={{
                      padding: "2px 6px",
                      background: "#e5e7eb",
                      color: "#6b7280",
                      borderRadius: "4px",
                      fontSize: "11px"
                    }}
                  >
                    {count} {type}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          {!isEditing && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
              <button
                onClick={onSelectAll}
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
                title="Select all items in this block"
              >
                Select All
              </button>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                style={{
                  padding: "4px 8px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #ef4444",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
                title="Delete block (items will become unassigned)"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Block Items */}
      {isExpanded && (
        <div style={{ padding: "12px 16px" }}>
          {block.items.length === 0 ? (
            <div style={{
              padding: "20px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
              border: "1px dashed #d1d5db",
              borderRadius: "4px",
              background: "#fafafa"
            }}>
              No items in this block. Drag items here to add them.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {block.items.map(item => (
                <div
                  key={item.unique_id}
                  onClick={() => onToggleItemSelection(item.unique_id)}
                  style={{
                    padding: "6px 12px",
                    background: selectedItems.has(item.unique_id) ? colors.badgeBackground : "white",
                    border: selectedItems.has(item.unique_id) 
                      ? `1px solid ${colors.borderColor}` 
                      : "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.unique_id)}
                    onChange={() => {}}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "500" }}>
                    {item.display_attributes.display_name || item.unique_id}
                  </span>
                  <span style={{ 
                    fontSize: "11px", 
                    color: "#6b7280",
                    padding: "2px 4px",
                    background: "#e5e7eb",
                    borderRadius: "2px"
                  }}>
                    {item.display_attributes.input_type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.unique_id);
                    }}
                    style={{
                      marginLeft: "auto",
                      padding: "2px 6px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                    title="Remove from block"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}