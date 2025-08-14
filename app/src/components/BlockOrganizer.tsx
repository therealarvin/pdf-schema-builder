"use client";

import React, { useState, useMemo } from "react";
import { SchemaItem } from "@/types/schema";
import BlockCard from "./BlockCard";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface BlockOrganizerProps {
  schema: SchemaItem[];
  onSchemaChange: (schema: SchemaItem[]) => void;
  formType: string;
}

interface Block {
  name: string;
  title?: string;
  description?: string;
  color_theme?: "blue" | "green" | "purple" | "orange" | "gray";
  items: SchemaItem[];
}

export default function BlockOrganizer({ schema, onSchemaChange }: BlockOrganizerProps) {
  const [newBlockName, setNewBlockName] = useState("");
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockDescription, setNewBlockDescription] = useState("");
  const [newBlockColor, setNewBlockColor] = useState<"blue" | "green" | "purple" | "orange" | "gray">("blue");

  // Organize schema items into blocks
  const blocks = useMemo(() => {
    const blockMap = new Map<string, Block>();
    const unassigned: SchemaItem[] = [];

    schema.forEach(item => {
      const blockName = item.display_attributes.block;
      if (blockName) {
        if (!blockMap.has(blockName)) {
          blockMap.set(blockName, {
            name: blockName,
            title: item.display_attributes.block_style?.title,
            description: item.display_attributes.block_style?.description,
            color_theme: item.display_attributes.block_style?.color_theme || "gray",
            items: []
          });
        }
        blockMap.get(blockName)!.items.push(item);
      } else {
        unassigned.push(item);
      }
    });

    return {
      blocks: Array.from(blockMap.values()),
      unassigned
    };
  }, [schema]);

  const handleCreateBlock = () => {
    if (!newBlockName.trim()) return;

    // Update selected items with the new block
    const updatedSchema = schema.map(item => {
      if (selectedItems.has(item.unique_id)) {
        return {
          ...item,
          display_attributes: {
            ...item.display_attributes,
            block: newBlockName,
            block_style: {
              title: newBlockTitle || newBlockName,
              description: newBlockDescription,
              color_theme: newBlockColor
            }
          }
        };
      }
      return item;
    });

    onSchemaChange(updatedSchema);
    setSelectedItems(new Set());
    setNewBlockName("");
    setNewBlockTitle("");
    setNewBlockDescription("");
    setNewBlockColor("blue");
    setShowNewBlockForm(false);
  };

  const handleAssignToBlock = (blockName: string) => {
    const updatedSchema = schema.map(item => {
      if (selectedItems.has(item.unique_id)) {
        // Get the block style from an existing item in that block
        const existingBlockItem = schema.find(s => s.display_attributes.block === blockName);
        const blockStyle = existingBlockItem?.display_attributes.block_style;
        
        return {
          ...item,
          display_attributes: {
            ...item.display_attributes,
            block: blockName,
            block_style: blockStyle
          }
        };
      }
      return item;
    });

    onSchemaChange(updatedSchema);
    setSelectedItems(new Set());
  };

  const handleRemoveFromBlock = (itemId: string) => {
    const updatedSchema = schema.map(item => {
      if (item.unique_id === itemId) {
        const { block: _block, block_style: _blockStyle, ...restAttributes } = item.display_attributes;
        return {
          ...item,
          display_attributes: restAttributes
        };
      }
      return item;
    });

    onSchemaChange(updatedSchema);
  };

  const handleDeleteBlock = (blockName: string) => {
    const updatedSchema = schema.map(item => {
      if (item.display_attributes.block === blockName) {
        const { block: _block, block_style: _blockStyle, ...restAttributes } = item.display_attributes;
        return {
          ...item,
          display_attributes: restAttributes
        };
      }
      return item;
    });

    onSchemaChange(updatedSchema);
  };

  const handleUpdateBlock = (blockName: string, updates: Partial<Block>) => {
    const updatedSchema = schema.map(item => {
      if (item.display_attributes.block === blockName) {
        return {
          ...item,
          display_attributes: {
            ...item.display_attributes,
            block: updates.name || blockName,
            block_style: {
              title: updates.title || item.display_attributes.block_style?.title,
              description: updates.description !== undefined ? updates.description : item.display_attributes.block_style?.description,
              color_theme: updates.color_theme || item.display_attributes.block_style?.color_theme
            }
          }
        };
      }
      return item;
    });

    onSchemaChange(updatedSchema);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const draggedItemId = String(active.id);
    const targetBlockName = String(over.id);
    
    // Find the block style from an existing item in the target block
    const existingBlockItem = schema.find(s => s.display_attributes.block === targetBlockName);
    const blockStyle = existingBlockItem?.display_attributes.block_style;
    
    const updatedSchema = schema.map(item => {
      if (item.unique_id === draggedItemId) {
        if (targetBlockName === "unassigned") {
          // Remove from block
          const { block: _block, block_style: _blockStyle, ...restAttributes } = item.display_attributes;
          return {
            ...item,
            display_attributes: restAttributes
          };
        } else {
          // Assign to block
          return {
            ...item,
            display_attributes: {
              ...item.display_attributes,
              block: targetBlockName,
              block_style: blockStyle
            }
          };
        }
      }
      return item;
    });

    onSchemaChange(updatedSchema);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = (items: SchemaItem[]) => {
    const newSelection = new Set(selectedItems);
    items.forEach(item => newSelection.add(item.unique_id));
    setSelectedItems(newSelection);
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px" 
      }}>
        <h2 style={{ margin: 0 }}>Block Organizer</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowNewBlockForm(true)}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            + New Block
          </button>
        </div>
      </div>

      {/* New Block Form */}
      {showNewBlockForm && (
        <div style={{
          padding: "16px",
          border: "2px dashed #2563eb",
          borderRadius: "8px",
          background: "#eff6ff",
          marginBottom: "20px"
        }}>
          <h3 style={{ margin: "0 0 12px 0" }}>Create New Block</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Block name (required)"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                flex: "1",
                minWidth: "150px"
              }}
            />
            <input
              type="text"
              placeholder="Block title (optional)"
              value={newBlockTitle}
              onChange={(e) => setNewBlockTitle(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                flex: "1",
                minWidth: "150px"
              }}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newBlockDescription}
              onChange={(e) => setNewBlockDescription(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                flex: "2",
                minWidth: "200px"
              }}
            />
            <select
              value={newBlockColor}
              onChange={(e) => setNewBlockColor(e.target.value as "blue" | "green" | "purple" | "orange" | "gray")}
              style={{
                padding: "8px",
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
              onClick={handleCreateBlock}
              disabled={!newBlockName.trim() || selectedItems.size === 0}
              style={{
                padding: "8px 16px",
                background: newBlockName.trim() && selectedItems.size > 0 ? "#10b981" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: newBlockName.trim() && selectedItems.size > 0 ? "pointer" : "not-allowed"
              }}
            >
              Create with {selectedItems.size} items
            </button>
            <button
              onClick={() => {
                setShowNewBlockForm(false);
                setNewBlockName("");
                setNewBlockTitle("");
                setNewBlockDescription("");
                setNewBlockColor("blue");
              }}
              style={{
                padding: "8px 16px",
                background: "white",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Unassigned Items */}
        {blocks.unassigned.length > 0 && (
          <div style={{
            marginBottom: "24px",
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#f9fafb"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "12px"
            }}>
              <h3 style={{ margin: 0 }}>
                Unassigned Items ({blocks.unassigned.length})
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => selectAll(blocks.unassigned)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    background: "white",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Select All
                </button>
                {selectedItems.size > 0 && (
                  <>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignToBlock(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="">Assign to Block...</option>
                      {blocks.blocks.map(block => (
                        <option key={block.name} value={block.name}>
                          {block.title || block.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowNewBlockForm(true)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Create New Block
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <SortableContext
              items={["unassigned"]}
              strategy={verticalListSortingStrategy}
              id="unassigned"
            >
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "8px",
                minHeight: "40px",
                padding: "8px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                background: "white"
              }}>
                {blocks.unassigned.map(item => (
                  <div
                    key={item.unique_id}
                    onClick={() => toggleItemSelection(item.unique_id)}
                    style={{
                      padding: "6px 12px",
                      background: selectedItems.has(item.unique_id) ? "#dbeafe" : "#f3f4f6",
                      border: selectedItems.has(item.unique_id) ? "1px solid #2563eb" : "1px solid #d1d5db",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.unique_id)}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span>{item.display_attributes.display_name || item.unique_id}</span>
                    <span style={{ 
                      fontSize: "11px", 
                      color: "#6b7280",
                      padding: "2px 4px",
                      background: "#e5e7eb",
                      borderRadius: "2px"
                    }}>
                      {item.display_attributes.input_type}
                    </span>
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Existing Blocks */}
        {blocks.blocks.map(block => (
          <BlockCard
            key={block.name}
            block={block}
            onUpdate={(updates) => handleUpdateBlock(block.name, updates)}
            onDelete={() => handleDeleteBlock(block.name)}
            onRemoveItem={handleRemoveFromBlock}
            selectedItems={selectedItems}
            onToggleItemSelection={toggleItemSelection}
            onSelectAll={() => selectAll(block.items)}
          />
        ))}

        {/* Drop zone for new block */}
        <div
          style={{
            marginTop: "24px",
            padding: "40px",
            border: "2px dashed #d1d5db",
            borderRadius: "8px",
            textAlign: "center",
            color: "#9ca3af",
            background: "#fafafa"
          }}
        >
          Drag items here to create a new block
        </div>
      </DndContext>

      {/* Selection info */}
      {selectedItems.size > 0 && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px 16px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span>{selectedItems.size} items selected</span>
          <button
            onClick={deselectAll}
            style={{
              padding: "4px 8px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}