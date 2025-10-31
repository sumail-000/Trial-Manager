"use client";

import { create } from "zustand";

import type { TrialStatus } from "../types";

type FilterState = {
  query: string;
  status: TrialStatus | "all";
  category: string | null;
  setQuery: (value: string) => void;
  setStatus: (value: TrialStatus | "all") => void;
  setCategory: (value: string | null) => void;
  reset: () => void;
};

export const useTrialFilters = create<FilterState>((set) => ({
  query: "",
  status: "all",
  category: null,
  setQuery: (value) => set({ query: value }),
  setStatus: (value) => set({ status: value }),
  setCategory: (value) => set({ category: value }),
  reset: () => set({ query: "", status: "all", category: null }),
}));

