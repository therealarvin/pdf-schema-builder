"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchemaItem } from "@/types/schema";

export type SchemaDefaults = {
  enabled: boolean;
  block?: string;
  block_style?: {
    title?: string;
    description?: string;
    icon?: string;
    color_theme?: "blue" | "green" | "purple" | "orange" | "gray";
  };
  isRequired?: boolean;
  isHidden?: boolean;
  isCached?: boolean;
  width?: number;
  placeholder?: string;
  description?: string;
};

type SchemaDefaultsState = {
  defaults: Record<string, SchemaDefaults>; // keyed by projectId
  getDefaults: (projectId: string) => SchemaDefaults;
  setDefaults: (projectId: string, defaults: SchemaDefaults) => void;
  resetDefaults: (projectId: string) => void;
};

const defaultDefaults: SchemaDefaults = {
  enabled: false,
  block: undefined,
  block_style: undefined,
  isRequired: false,
  isHidden: false,
  isCached: false,
  width: undefined,
  placeholder: undefined,
  description: undefined,
};

export const useSchemaDefaultsStore = create<SchemaDefaultsState>()(
  persist(
    (set, get) => ({
      defaults: {},
      getDefaults: (projectId: string) => {
        return get().defaults[projectId] || defaultDefaults;
      },
      setDefaults: (projectId: string, defaults: SchemaDefaults) => {
        set((state) => ({
          defaults: {
            ...state.defaults,
            [projectId]: defaults,
          },
        }));
      },
      resetDefaults: (projectId: string) => {
        set((state) => ({
          defaults: {
            ...state.defaults,
            [projectId]: defaultDefaults,
          },
        }));
      },
    }),
    {
      name: "psb_schema_defaults",
      version: 1,
    }
  )
);

/**
 * Apply defaults to a schema item if defaults are enabled
 */
export function applySchemaDefaults(
  item: SchemaItem,
  defaults: SchemaDefaults
): SchemaItem {
  if (!defaults.enabled) {
    return item;
  }

  const updatedItem = { ...item };

  // Apply block
  if (defaults.block !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      block: defaults.block,
    };
  }

  // Apply block_style
  if (defaults.block_style !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      block_style: defaults.block_style,
    };
  }

  // Apply isRequired
  if (defaults.isRequired !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      isRequired: defaults.isRequired,
    };
  }

  // Apply isHidden
  if (defaults.isHidden !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      isHidden: defaults.isHidden,
    };
  }

  // Apply isCached
  if (defaults.isCached !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      isCached: defaults.isCached,
    };
  }

  // Apply width
  if (defaults.width !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      width: defaults.width,
    };
  }

  // Apply placeholder
  if (defaults.placeholder !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      placeholder: defaults.placeholder,
    };
  }

  // Apply description
  if (defaults.description !== undefined) {
    updatedItem.display_attributes = {
      ...updatedItem.display_attributes,
      description: defaults.description,
    };
  }

  return updatedItem;
}
