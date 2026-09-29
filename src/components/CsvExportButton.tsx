"use client";

import { Download } from "lucide-react";

interface CsvExportButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  buttonLabel?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function CsvExportButton({
  filename,
  headers,
  rows,
  buttonLabel = "Export CSV",
  variant = "outline",
}: CsvExportButtonProps) {
  function handleDownload() {
    const escapeCell = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      // Escape double quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headerLine = headers.map(escapeCell).join(",");
    const rowLines = rows.map((row) => row.map(escapeCell).join(","));
    
    // Add UTF-8 BOM so Excel opens Arabic and special characters properly
    const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const baseStyle =
    "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer print:hidden";
  const styles = {
    primary: `${baseStyle} bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs`,
    secondary: `${baseStyle} bg-slate-900 hover:bg-black text-white shadow-xs`,
    outline: `${baseStyle} bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs`,
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={styles[variant]}
      title="Download as CSV for Microsoft Excel"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{buttonLabel}</span>
    </button>
  );
}