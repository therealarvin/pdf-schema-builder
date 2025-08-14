"use client";

import { useState } from "react";
import { PDFField } from "@/types/schema";

interface CoordinatesViewerProps {
  extractedFields: PDFField[];
}

export default function CoordinatesViewer({ extractedFields }: CoordinatesViewerProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyFormat, setCopyFormat] = useState<"simple" | "json" | "detailed">("simple");

  // Helper function to get coordinates from rect
  const getCoordinates = (field: PDFField) => {
    const [x1, y1, x2, y2] = field.rect;
    return {
      x: Math.round(x1),
      y: Math.round(y1),
      width: Math.round(x2 - x1),
      height: Math.round(y2 - y1)
    };
  };

  const generateSimpleFormat = () => {
    return extractedFields.map(field => {
      const coords = getCoordinates(field);
      return `${field.name}: page=${field.page}, x=${coords.x}, y=${coords.y}, w=${coords.width}, h=${coords.height}`;
    }).join('\n');
  };

  const generateJSONFormat = () => {
    const coordsData = extractedFields.map(field => {
      const coords = getCoordinates(field);
      return {
        name: field.name,
        type: field.type,
        page: field.page,
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height
      };
    });
    return JSON.stringify(coordsData, null, 2);
  };

  const generateDetailedFormat = () => {
    return extractedFields.map(field => {
      const coords = getCoordinates(field);
      const details = [
        `Field: ${field.name}`,
        `  Type: ${field.type}`,
        `  Page: ${field.page}`,
        `  Position: (${coords.x}, ${coords.y})`,
        `  Size: ${coords.width} x ${coords.height}`,
        `  Area: ${coords.width * coords.height} square units`
      ];
      return details.join('\n');
    }).join('\n\n');
  };

  const copyToClipboard = async () => {
    try {
      let textToCopy = "";
      switch (copyFormat) {
        case "simple":
          textToCopy = generateSimpleFormat();
          break;
        case "json":
          textToCopy = generateJSONFormat();
          break;
        case "detailed":
          textToCopy = generateDetailedFormat();
          break;
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (extractedFields.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        <h2 style={{ marginBottom: "10px" }}>No Fields Extracted</h2>
        <p>The PDF viewer will automatically extract fields when a PDF is loaded.</p>
        <p>Once extracted, field coordinates will appear here for easy copying.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>Field Coordinates ({extractedFields.length} fields)</h2>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
          <label style={{ fontWeight: "500" }}>Format:</label>
          <select 
            value={copyFormat} 
            onChange={(e) => setCopyFormat(e.target.value as "simple" | "json" | "detailed")}
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          >
            <option value="simple">Simple Text</option>
            <option value="json">JSON</option>
            <option value="detailed">Detailed</option>
          </select>
          
          <button
            onClick={copyToClipboard}
            style={{
              padding: "8px 16px",
              background: copySuccess ? "#10b981" : "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.2s"
            }}
          >
            {copySuccess ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        gap: "20px",
        minHeight: 0
      }}>
        {/* Table View */}
        <div style={{ 
          flex: "1 1 60%", 
          border: "1px solid #e5e7eb", 
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            padding: "10px", 
            background: "#f9fafb", 
            borderBottom: "1px solid #e5e7eb",
            fontWeight: "600"
          }}>
            Coordinates Table
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", position: "sticky", top: 0 }}>
                  <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Field Name</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Type</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Page</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>X</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Y</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Width</th>
                  <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Height</th>
                </tr>
              </thead>
              <tbody>
                {extractedFields.map((field, index) => {
                  const coords = getCoordinates(field);
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px", fontFamily: "monospace", fontSize: "12px" }}>{field.name}</td>
                      <td style={{ padding: "8px", textAlign: "center", fontSize: "12px" }}>{field.type}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{field.page}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{coords.x}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{coords.y}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{coords.width}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{coords.height}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview */}
        <div style={{ 
          flex: "1 1 40%", 
          border: "1px solid #e5e7eb", 
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            padding: "10px", 
            background: "#f9fafb", 
            borderBottom: "1px solid #e5e7eb",
            fontWeight: "600"
          }}>
            Preview ({copyFormat === "simple" ? "Simple Text" : copyFormat === "json" ? "JSON" : "Detailed"})
          </div>
          <div style={{ 
            flex: 1, 
            padding: "10px", 
            overflow: "auto",
            background: "#f9fafb"
          }}>
            <pre style={{ 
              margin: 0, 
              fontSize: "12px", 
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}>
              {copyFormat === "simple" && generateSimpleFormat()}
              {copyFormat === "json" && generateJSONFormat()}
              {copyFormat === "detailed" && generateDetailedFormat()}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: "20px", 
        padding: "15px", 
        background: "#f0f9ff", 
        borderRadius: "8px",
        fontSize: "14px",
        color: "#0369a1"
      }}>
        <strong>💡 Tip:</strong> The coordinates represent the position and size of form fields in the PDF. 
        Use these values to programmatically place fields or understand the PDF structure. 
        Coordinates are in PDF units where (0,0) is typically the bottom-left corner of the page.
      </div>
    </div>
  );
}