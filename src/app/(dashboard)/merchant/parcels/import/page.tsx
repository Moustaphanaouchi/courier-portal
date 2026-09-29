"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2,
  PackageCheck
} from "lucide-react";

interface ParsedParcel {
  recipientName: string;
  recipientPhone: string;
  recipientAltPhone?: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  landmark?: string;
  codAmount: number;
  codCurrency: "USD" | "LBP";
  deliveryFee: number;
  notes?: string;
}

export default function BulkImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedParcel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user.merchantId) {
          setMerchantId(data.user.merchantId);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  // Download Sample Template CSV
  function downloadSample() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "recipientName,recipientPhone,recipientAltPhone,governorate,city,detailedAddress,landmark,codAmount,codCurrency,deliveryFee,notes\n" +
      "Karim Salameh,+96170123456,,Beirut,Hamra,Bliss Street Al-Amine Bldg 2nd Fl,Facing AUB,35.00,USD,3.5,Fragile items\n" +
      "Lara Haddad,+96103987654,+96171223344,Mount Lebanon,Jounieh,Old Souk Saint George St,,2500000,LBP,4.0,Call before arrival\n" +
      "Ziad El Masri,+96176554433,,North,Tripoli,Mina Port Road Sea view Bldg,,50.00,USD,3.5,Handle with care";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "courier_bulk_manifest_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Parse CSV File Client-Side
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== "");
        
        if (lines.length <= 1) {
          throw new Error("CSV file contains no order rows.");
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        
        const requiredHeaders = ["recipientname", "recipientphone", "governorate", "city", "detailedaddress", "codamount"];
        for (const req of requiredHeaders) {
          if (!headers.includes(req)) {
            throw new Error(`Missing required CSV column: "${req}"`);
          }
        }

        const rows: ParsedParcel[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length < headers.length) continue;

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          rows.push({
            recipientName: rowData["recipientname"] || "",
            recipientPhone: rowData["recipientphone"] || "",
            recipientAltPhone: rowData["recipientaltphone"] || undefined,
            governorate: rowData["governorate"] || "Beirut",
            city: rowData["city"] || "Beirut",
            detailedAddress: rowData["detailedaddress"] || "",
            landmark: rowData["landmark"] || undefined,
            codAmount: parseFloat(rowData["codamount"]) || 0,
            codCurrency: (rowData["codcurrency"]?.toUpperCase() === "LBP" ? "LBP" : "USD"),
            deliveryFee: parseFloat(rowData["deliveryfee"]) || 3.0,
            notes: rowData["notes"] || undefined,
          });
        }

        if (rows.length === 0) {
          throw new Error("No valid order rows parsed from CSV.");
        }

        setParsedRows(rows);
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV file.");
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  }

  async function handleBatchSubmit() {
    if (!merchantId || parsedRows.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/parcels/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          parcels: parsedRows,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Batch import failed");
      }

      setImportedCount(data.count);
      setParsedRows([]);
      setFileName(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setFileName(null);
    setParsedRows([]);
    setError(null);
    setImportedCount(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Operations Hub
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Bulk CSV Manifest Upload</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download CSV Template</span>
            </button>
            <Link
              href="/merchant/parcels/new"
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
            >
              Single Entry Form
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {importedCount !== null && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Batch Ingestion Complete!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Successfully created {importedCount} new parcels with unique tracking waybills.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Upload Another
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {parsedRows.length === 0 && importedCount === null && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-blue-500 transition cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {fileName ? fileName : "Click to select or drop CSV manifest file"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Accepts CSV files with recipient name, telephone, governorate, city, address, and COD amounts.
            </p>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{fileName}</span>
                  <span className="text-[11px] text-slate-400">{parsedRows.length} valid order rows detected</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={importing}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  onClick={handleBatchSubmit}
                  disabled={importing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4" />
                      <span>Confirm & Ingest {parsedRows.length} Parcels</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Destination</th>
                      <th className="p-3">COD Amount</th>
                      <th className="p-3">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900">{row.recipientName}</td>
                        <td className="p-3 font-mono">{row.recipientPhone}</td>
                        <td className="p-3">
                          <span className="font-medium text-slate-800">{row.city}</span>
                          <span className="text-[11px] text-slate-400 block">{row.detailedAddress}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {row.codCurrency === "USD" ? `$${row.codAmount}` : `${row.codAmount.toLocaleString()} LBP`}
                        </td>
                        <td className="p-3 font-mono text-slate-500">${row.deliveryFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}