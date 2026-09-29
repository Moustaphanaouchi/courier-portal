"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintTrigger() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition"
    >
      <Printer className="w-4 h-4" /> Print Label
    </button>
  );
}