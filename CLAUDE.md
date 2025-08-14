# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Schema Builder - A Next.js application for extracting form fields from PDF documents and creating structured schemas for form automation. This monorepo uses npm workspaces with the main app in the `/app` directory.

## Critical Instructions

- **NEVER change the model name away from `gpt-5-nano` without explicit instructions** - The AI integration is specifically configured for GPT-5 Nano's unique API requirements
- When modifying AI service code, always include `reasoning_effort` parameter and use `max_completion_tokens` (not `max_tokens`)

## Development Commands

```bash
# Development
npm run dev              # Runs on port 3000 (or PORT env var)
npm run dev -w app       # Run from root (workspace command)
cd app && npm run dev    # Run from app directory

# Build & Production
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint (Next.js rules)


# Testing
node app/simple-test.mjs          # Basic E2E test with Playwright
node app/test-new-features.mjs    # Feature-specific E2E tests
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router and React 19
- **Language**: TypeScript with strict mode
- **PDF Processing**: PDF.js via react-pdf
- **State Management**: Zustand with localStorage persistence
- **Storage**: IndexedDB for PDFs and schemas
- **AI Integration**: OpenAI GPT-5 Nano for field analysis
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui

### Key Architectural Patterns

1. **Client-Side Storage Architecture**
   - IndexedDB stores PDF data and schemas (app/src/lib/pdfStorage.ts, schemaStorage.ts)
   - Zustand manages project metadata in localStorage (app/src/stores/projects.ts)
   - No server-side persistence - fully client-side application

2. **Component Structure**
   - Page components in `app/src/app/[projectId]/page.tsx` handle routing
   - Feature components in `app/src/components/` are self-contained
   - UI primitives in `app/src/components/ui/` from shadcn

3. **PDF Field Processing Flow**
   - PDF.js extracts form fields with coordinates
   - Fields grouped by type (text-continuation, checkbox, radio, etc.)
   - Groups converted to SchemaItems with AI-enhanced attributes
   - Visual overlays show field states (selected, grouped, linkable)

4. **AI Service Integration**
   - GPT-5 Nano for field attribute generation and schema organization
   - Screenshot capture with html2canvas for visual context
   - Streaming responses for beautification iterations
   - Comprehensive logging in `app/ai-logs/` directory

## Core Types & Interfaces

The schema system revolves around `SchemaItem` (app/src/types/schema.ts):
- `pdf_attributes`: Maps to PDF form fields
- `display_attributes`: Rendering configuration
- `checkbox_options.linkedFields`: References to other schema items
- `PDFField`: Raw field data from PDF.js extraction

## API Routes

All AI endpoints in `app/src/app/api/`:
- `/api/generate-field-attributes` - Analyze fields and generate attributes
- `/api/organize-schema` - Group schema items into logical blocks
- `/api/beautify-schema` - Iterative UI improvements
- `/api/generate-checkbox-labels` - Smart checkbox label generation
- `/api/ai-logs` - Retrieve AI interaction logs

## Field State Visual Indicators

PDF viewer field colors (app/src/components/PdfViewer.tsx):
- **Gray (#9ca3af)**: Default unselected fields
- **Blue (#2563eb)**: Currently selected fields
- **Purple (#8b5cf6)**: Grouped fields in schema
- **Green (#10b981)**: Linkable fields in linking mode

## Testing Approach

Playwright E2E tests simulate real user workflows:
1. Create project with form type
2. Upload PDF (test file: `app/public/Animal_Agreement.pdf`)
3. Select and group fields
4. Edit schema properties
5. Test linking functionality
6. Verify TypeScript export

## Common Development Tasks

### Adding New Field Types
1. Update `SchemaItem.display_attributes.input_type` in types/schema.ts
2. Add field renderer in components/FormInput/fields/
3. Update FieldRenderer.tsx to handle new type
4. Add special_input configuration if needed

### Modifying AI Prompts
1. AI service functions in app/src/lib/aiService.ts
2. Each function has specific prompt structure
3. Test with app/ai-logs/ to verify responses
4. Maintain GPT-5 Nano specific parameters

### Debugging Field Grouping
1. Check handleFieldClick in [projectId]/page.tsx
2. Verify field selection state management
3. Inspect FieldGrouping.tsx dialog logic
4. Review createSchemaItemFromGroup function

## Important Gotchas

1. **GPT-5 Nano API Requirements**
   - Must include `reasoning_effort` parameter
   - Use `max_completion_tokens` not `max_tokens`
   - Temperature parameter not supported

2. **IndexedDB Limitations**
   - Browser storage limits apply (~50MB typical)
   - Clear storage if corruption occurs
   - Async operations require proper error handling

3. **PDF.js Worker**
   - Worker file must be in public directory
   - CORS issues with external PDFs
   - Memory usage with large PDFs

4. **Field Overlay Positioning**
   - Coordinates are PDF-space, not screen-space
   - Requires transformation for display
   - Z-index management for overlapping fields

## Project File Structure

```
pdf-schema-builder/
├── app/                    # Main Next.js application
│   ├── src/
│   │   ├── app/           # App router pages and API
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and services
│   │   ├── stores/       # Zustand state stores
│   │   └── types/        # TypeScript definitions
│   ├── public/           # Static assets and test PDFs
│   └── ai-logs/         # AI request/response logs
├── package.json          # Root workspace config
└── CLAUDE.md            # This file
```