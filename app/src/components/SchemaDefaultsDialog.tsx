"use client";

import React, { useState, useEffect } from "react";
import { SchemaDefaults, useSchemaDefaultsStore } from "@/stores/schemaDefaults";

interface SchemaDefaultsDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SchemaDefaultsDialog({ projectId, isOpen, onClose }: SchemaDefaultsDialogProps) {
  const { getDefaults, setDefaults, resetDefaults } = useSchemaDefaultsStore();
  const [localDefaults, setLocalDefaults] = useState<SchemaDefaults>(getDefaults(projectId));

  // Load defaults when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalDefaults(getDefaults(projectId));
    }
  }, [isOpen, projectId, getDefaults]);

  const handleSave = () => {
    setDefaults(projectId, localDefaults);
    onClose();
  };

  const handleReset = () => {
    resetDefaults(projectId);
    setLocalDefaults(getDefaults(projectId));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "600px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Schema Item Defaults</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "20px", padding: "12px", background: "#eff6ff", borderRadius: "6px", fontSize: "14px" }}>
          <strong>Note:</strong> When enabled, these defaults will be applied to all newly created schema items (except PDF attributes).
        </div>

        {/* Enable/Disable Toggle */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              background: localDefaults.enabled ? "#eff6ff" : "white",
            }}
          >
            <input
              type="checkbox"
              checked={localDefaults.enabled}
              onChange={(e) => setLocalDefaults({ ...localDefaults, enabled: e.target.checked })}
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
            <div>
              <div style={{ fontWeight: "600", fontSize: "16px" }}>Enable Defaults</div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>Apply these defaults to new schema items</div>
            </div>
          </label>
        </div>

        {/* Defaults Fields (only show if enabled) */}
        {localDefaults.enabled && (
          <>
            {/* Block */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Block Label</label>
              <input
                type="text"
                value={localDefaults.block || ""}
                onChange={(e) => setLocalDefaults({ ...localDefaults, block: e.target.value || undefined })}
                placeholder="e.g., Tenant Information"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                Optional: Group new items into this block
              </div>
            </div>

            {/* Block Style - Title */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Block Title</label>
              <input
                type="text"
                value={localDefaults.block_style?.title || ""}
                onChange={(e) =>
                  setLocalDefaults({
                    ...localDefaults,
                    block_style: { ...localDefaults.block_style, title: e.target.value || undefined },
                  })
                }
                placeholder="e.g., Personal Details"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Block Style - Description */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Block Description</label>
              <textarea
                value={localDefaults.block_style?.description || ""}
                onChange={(e) =>
                  setLocalDefaults({
                    ...localDefaults,
                    block_style: { ...localDefaults.block_style, description: e.target.value || undefined },
                  })
                }
                placeholder="Optional description for the block"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  minHeight: "60px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Block Style - Color Theme */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Block Color Theme</label>
              <select
                value={localDefaults.block_style?.color_theme || ""}
                onChange={(e) =>
                  setLocalDefaults({
                    ...localDefaults,
                    block_style: {
                      ...localDefaults.block_style,
                      color_theme: (e.target.value as any) || undefined,
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <option value="">None</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="gray">Gray</option>
              </select>
            </div>

            {/* Width */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Width (12-column grid)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={localDefaults.width || ""}
                onChange={(e) =>
                  setLocalDefaults({ ...localDefaults, width: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="e.g., 6"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>12 = full width, 6 = half width</div>
            </div>

            {/* Placeholder */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Placeholder Text</label>
              <input
                type="text"
                value={localDefaults.placeholder || ""}
                onChange={(e) => setLocalDefaults({ ...localDefaults, placeholder: e.target.value || undefined })}
                placeholder="e.g., Enter value..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Field Description</label>
              <textarea
                value={localDefaults.description || ""}
                onChange={(e) => setLocalDefaults({ ...localDefaults, description: e.target.value || undefined })}
                placeholder="Optional description for the field"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  minHeight: "60px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Checkboxes */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Field Properties</label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  padding: "8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={localDefaults.isRequired || false}
                  onChange={(e) => setLocalDefaults({ ...localDefaults, isRequired: e.target.checked })}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: "500" }}>Required</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>Field must be filled</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  padding: "8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={localDefaults.isHidden || false}
                  onChange={(e) => setLocalDefaults({ ...localDefaults, isHidden: e.target.checked })}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: "500" }}>Hidden</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>Field is hidden by default</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={localDefaults.isCached || false}
                  onChange={(e) => setLocalDefaults({ ...localDefaults, isCached: e.target.checked })}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: "500" }}>Cached</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>Value is cached for reuse</div>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          <button
            onClick={handleReset}
            style={{
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Save Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
