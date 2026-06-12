"use client";

import { createContext } from "react";

/** Nodes call this with their id to open the full-view (expand) modal. */
export const ExpandContext = createContext<(id: string) => void>(() => {});
