"use client";

import React, { useState, useEffect } from "react";
import { Schema } from "@/types/schema";

interface SchemaExportProps {
  schema: Schema;
  formType: string;
  onSchemaChange?: (schema: Schema) => void;
}

export default function SchemaExport({ schema, formType, onSchemaChange }: SchemaExportProps) {
  const [editableContent, setEditableContent] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update editable content when schema changes or component mounts
  useEffect(() => {
    setEditableContent(generateTypeScript());
  }, [schema, formType]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const generateTypeScript = (): string => {
    const schemaName = formType.replace(/[^a-zA-Z0-9]/g, "_");
    
    // Clean up empty arrays and undefined values
    const cleanedSchema = JSON.parse(JSON.stringify(schema, (key, value) => {
      // Handle function serialization for attribute operations
      // Only skip if it's a function (attribute.operation or attribute.reverseOperation)
      if ((key === "operation" || key === "reverseOperation") && typeof value === 'function') {
        return undefined; // Skip functions in JSON
      }
      // Remove empty linked_form_fields_text arrays
      if (key === "linked_form_fields_text" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove empty linked_dates arrays
      if (key === "linked_dates" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove other empty arrays that shouldn't be in the output
      if (key === "linkedFields" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove empty visibleIf arrays
      if (key === "visibleIf" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      return value;
    }));
    
    const schemaString = JSON.stringify(cleanedSchema, null, 2);

    return `import { Schema, SchemaItem } from '@/types/schema';

export const ${schemaName}_schema: Schema = ${schemaString};

export default ${schemaName}_schema;`;
  };

  const parseTypeScriptToSchema = (tsContent: string): Schema | null => {
    try {
      // Extract the JSON part from the TypeScript
      // Look for the schema assignment
      const schemaMatch = tsContent.match(/(?:const|export const)\s+\w+(?:_schema)?:\s*Schema\s*=\s*(\[[\s\S]*?\]);/);
      
      if (!schemaMatch || !schemaMatch[1]) {
        throw new Error("Could not find schema definition in TypeScript");
      }
      
      // Parse the JSON string
      // First, we need to handle any JavaScript-specific syntax that might be in there
      let jsonString = schemaMatch[1];
      
      // Remove trailing commas (not valid in JSON)
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to parse it
      const parsedSchema = JSON.parse(jsonString);
      
      // Validate it's an array
      if (!Array.isArray(parsedSchema)) {
        throw new Error("Schema must be an array");
      }
      
      return parsedSchema as Schema;
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse TypeScript");
      return null;
    }
  };
  
  const handleApplyChanges = () => {
    const parsedSchema = parseTypeScriptToSchema(editableContent);
    if (parsedSchema && onSchemaChange) {
      onSchemaChange(parsedSchema);
      setParseError(null);
      setIsEditing(false);
    }
  };
  
  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
    // Clear error when user starts typing
    if (parseError) {
      setParseError(null);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(isEditing ? editableContent : generateTypeScript());
    alert("Schema copied to clipboard!");
  };

  const downloadFile = () => {
    const blob = new Blob([isEditing ? editableContent : generateTypeScript()], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formType}_schema.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    // Clean up empty arrays for JSON download too
    const cleanedSchema = JSON.parse(JSON.stringify(schema, (key, value) => {
      // Handle function serialization for attribute operations
      // Only skip if it's a function (attribute.operation or attribute.reverseOperation)
      if ((key === "operation" || key === "reverseOperation") && typeof value === 'function') {
        return undefined; // Skip functions in JSON
      }
      // Remove empty linked_form_fields_text arrays
      if (key === "linked_form_fields_text" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove empty linked_dates arrays
      if (key === "linked_dates" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove other empty arrays that shouldn't be in the output
      if (key === "linkedFields" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      // Remove empty visibleIf arrays
      if (key === "visibleIf" && Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      return value;
    }));
    
    const blob = new Blob([JSON.stringify(cleanedSchema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formType}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ 
        padding: "10px", 
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        gap: "10px",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, flex: 1 }}>TypeScript Schema Export</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{ 
              padding: "6px 12px",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            ✏️ Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleApplyChanges}
              style={{ 
                padding: "6px 12px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              ✓ Apply Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditableContent(generateTypeScript());
                setParseError(null);
              }}
              style={{ 
                padding: "6px 12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              ✗ Cancel
            </button>
          </>
        )}
        <button
          onClick={copyToClipboard}
          style={{ 
            padding: "6px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer"
          }}
        >
          Copy to Clipboard
        </button>
        <button
          onClick={downloadFile}
          style={{ 
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          Download .ts
        </button>
        <button
          onClick={downloadJSON}
          style={{ 
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: "#10b981",
            color: "white",
            cursor: "pointer"
          }}
        >
          Download .json
        </button>
      </div>
      
      {parseError && (
        <div style={{
          padding: "10px",
          background: "#fee2e2",
          borderBottom: "1px solid #fca5a5",
          color: "#dc2626",
          fontSize: "14px"
        }}>
          ⚠️ Error parsing TypeScript: {parseError}
        </div>
      )}
      
      {isEditing ? (
        <textarea
          value={editableContent}
          onChange={(e) => handleContentChange(e.target.value)}
          style={{
            flex: 1,
            margin: 0,
            padding: "20px",
            background: "#1e293b",
            color: "#e2e8f0",
            border: "none",
            fontFamily: "Consolas, Monaco, 'Courier New', monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            resize: "none",
            outline: "none"
          }}
          spellCheck={false}
        />
      ) : (
        <pre style={{ 
          flex: 1,
          margin: 0,
          padding: "20px",
          background: "#1e293b",
          color: "#e2e8f0",
          overflow: "auto",
          fontSize: "14px",
          lineHeight: "1.5"
        }}>
          <code>{editableContent || generateTypeScript()}</code>
        </pre>
      )}
    </div>
  );
}