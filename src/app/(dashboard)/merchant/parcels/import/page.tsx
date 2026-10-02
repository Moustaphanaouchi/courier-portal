"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ParsedParcel {
  recipientName: string;
  recipientPhone: string;
  city: string;
  address: string;
  codAmount: number;
  codCurrency: "USD" | "LBP";
  notes?: string;
}

export default function MerchantBulkImportPage() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedParcel[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
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
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [router]);

  function downloadSampleCsv() {
    const csvContent =
      "Recipient Name,Recipient Phone,Governorate - City,Detailed Address,COD Amount,Currency,Notes\n" +
      "Mazen Daher,+961 70 123456,Beirut - Hamra,Bliss Street Al Noor Bldg 3rd Fl,45,USD,Fragile glass\n" +
      "Nour Kassir,+961 03 987654,Mount Lebanon - Jounieh,Highway facing port,3500000,LBP,Call before delivery\n" +
      "Karim Traboulsi,+961 71 554433,North - Tripoli,Mina Corniche Near Clock Tower,30,USD,Exchange package";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cedex_logistics_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setParseErrors([]);
    setImportSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(selectedFile);
  }

  function parseCsv(raw: string) {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setError(isRtl ? "الملف فارغ أو لا يحتوي على صفوف بيانات صالحة." : "The uploaded file contains no data rows.");
      return;
    }

    const rows: ParsedParcel[] = [];
    const errs: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length < 5) continue;

      const [name, phone, city, address, cod, currency, notes] = cols;

      if (!name || !phone || !address) {
        errs.push(`${isRtl ? "الصف" : "Row"} ${i + 1}: ${isRtl ? "الاسم، الهاتف، أو العنوان مفقود." : "Missing required name, phone, or address."}`);
        continue;
      }

      const numCod = parseFloat(cod) || 0;
      const validCurrency = currency?.toUpperCase() === "LBP" ? "LBP" : "USD";

      rows.push({
        recipientName: name,
        recipientPhone: phone,
        city: city || "Beirut - Hamra",
        address: address,
        codAmount: numCod,
        codCurrency: validCurrency,
        notes: notes || undefined,
      });
    }

    setParsedRows(rows);
    setParseErrors(errs);
  }

  async function handleImport() {
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
      if (!res.ok) throw new Error(data.error || "Failed to process bulk upload.");

      setImportSuccessCount(data.count || parsedRows.length);
      setParsedRows([]);
      setFile(null);
    } catch (err: any) {
      setError(err.message || "An error occurred during import.");
    } finally {
      setImporting(false);
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/merchant/parcels"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition gap-1.5"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{t("myParcels")}</span>
          </Link>

          <button
            onClick={downloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{t("downloadTemplate")}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t("bulkUploadTitle")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t("bulkUploadSubtitle")}</p>
            </div>
          </div>

          {importSuccessCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {t("importSuccess")} ({importSuccessCount} {isRtl ? "شحنة" : "parcels"})
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <UploadCloud className="w-10 h-10 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">{t("dragDropCsv")}</p>
              <p className="text-xs text-slate-400 max-w-md">{t("supportedFormats")}</p>
              {file && (
                <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {isRtl ? "معاينة البيانات المستخرجة" : "Extracted Waybills Preview"} ({parsedRows.length})
                </h3>
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? "إلغاء الملف" : "Clear"}</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">{t("recipient")}</th>
                      <th className="px-4 py-2.5">{t("phone")}</th>
                      <th className="px-4 py-2.5">{t("destination")}</th>
                      <th className="px-4 py-2.5">{t("codAmount")}</th>
                      <th className="px-4 py-2.5">{t("currency")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{row.recipientName}</td>
                        <td className="px-4 py-2.5 text-slate-600" dir="ltr">{row.recipientPhone}</td>
                        <td className="px-4 py-2.5 text-slate-600 truncate max-w-xs">{row.city}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{row.codAmount}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.codCurrency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 5 && (
                <p className="text-[11px] text-slate-400 text-center">
                  +{parsedRows.length - 5} {isRtl ? "شحنات إضافية جاهزة للاستيراد" : "more parcels ready for import"}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {importing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>
                      {t("uploadButton")} ({parsedRows.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}