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
  recipientAltPhone?: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  codAmount: number;
  codCurrency: "USD" | "LBP";
  deliveryFee: number;
  notes?: string;
}

function detectGovernorate(cityOrGov: string): { governorate: string; fee: number } {
  const text = (cityOrGov || "").toLowerCase().trim();

  if (text.includes("beirut") || text.includes("بيروت") || text.includes("hamra") || text.includes("achrafieh")) {
    return { governorate: "Beirut", fee: 3.0 };
  }
  if (
    text.includes("mount") ||
    text.includes("jabal") ||
    text.includes("jounieh") ||
    text.includes("baabda") ||
    text.includes("matn") ||
    text.includes("metn") ||
    text.includes("keserwan") ||
    text.includes("chouf") ||
    text.includes("aley") ||
    text.includes("جبل لبنان") ||
    text.includes("كسروان") ||
    text.includes("جونيه")
  ) {
    return { governorate: "Mount Lebanon", fee: 4.0 };
  }
  if (
    text.includes("north") ||
    text.includes("tripoli") ||
    text.includes("شمال") ||
    text.includes("طرابلس") ||
    text.includes("batroun") ||
    text.includes("koura")
  ) {
    return { governorate: "North", fee: 4.5 };
  }
  if (
    text.includes("south") ||
    text.includes("saida") ||
    text.includes("sidon") ||
    text.includes("tyre") ||
    text.includes("sour") ||
    text.includes("جنوب") ||
    text.includes("صيدا") ||
    text.includes("صور")
  ) {
    return { governorate: "South", fee: 4.5 };
  }
  if (
    text.includes("bekaa") ||
    text.includes("zahle") ||
    text.includes("بقاع") ||
    text.includes("زحلة") ||
    text.includes("chtoura")
  ) {
    return { governorate: "Bekaa", fee: 5.0 };
  }
  if (text.includes("nabatieh") || text.includes("نبطية")) {
    return { governorate: "Nabatieh", fee: 5.0 };
  }
  if (text.includes("baalbek") || text.includes("hermel") || text.includes("بعلبك")) {
    return { governorate: "Baalbek-Hermel", fee: 5.5 };
  }
  if (text.includes("akkar") || text.includes("عكار")) {
    return { governorate: "Akkar", fee: 5.5 };
  }

  return { governorate: "Beirut", fee: 3.0 };
}

// RFC-4180 Compliant CSV Line Parser (handles quotes, commas inside text, and semicolons)
function parseCSVLine(text: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export default function MerchantBulkImportPage() {
  const router = useRouter();
  const { t, isRtl, lang } = useLanguage();

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

  function downloadSampleFile() {
    const csvContent =
      "\uFEFFRecipient Name,Recipient Phone,Governorate,City,Detailed Address,COD Amount,Currency,Notes\r\n" +
      'Mazen Daher,70123456,Beirut,Hamra,"Bliss Street, Al Noor Bldg 3rd Fl",45,USD,Fragile glassware\r\n' +
      'Nour Kassir,03987654,Mount Lebanon,Jounieh,"Highway facing port, White gate",3500000,LBP,Call before arrival\r\n' +
      'Karim Traboulsi,71554433,North,Tripoli,"Mina Corniche, Near Clock Tower",30,USD,Exchange package\r\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cedex_shipments_template.csv");
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
      try {
        const text = (event.target?.result as string) || "";
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          setError(
            lang === "ar"
              ? "الملف فارغ أو لا يحتوي على صفوف بيانات صالحة."
              : "The uploaded file does not contain data rows."
          );
          return;
        }

        // Detect delimiter (comma, semicolon, or tab)
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes(";") && !firstLine.includes(",")) delimiter = ";";
        if (firstLine.includes("\t") && !firstLine.includes(",")) delimiter = "\t";

        const headers = parseCSVLine(firstLine, delimiter).map((h) => h.toLowerCase());

        // Header mapping
        const getIdx = (pattern: RegExp) => headers.findIndex((h) => pattern.test(h));
        const nameIdx = getIdx(/name|recipient|اسم/);
        const phoneIdx = getIdx(/phone|mobile|هاتف/);
        const govIdx = getIdx(/governorate|محافظة/);
        const cityIdx = getIdx(/city|مدينة|منطقة/);
        const addrIdx = getIdx(/address|detailed|street|عنوان/);
        const codIdx = getIdx(/cod|amount|مبلغ/);
        const currIdx = getIdx(/curr|عملة/);
        const notesIdx = getIdx(/note|instruction|ملاحظ/);

        const validParcels: ParsedParcel[] = [];
        const errs: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i], delimiter);
          if (cols.length < 3) continue;

          const name = (nameIdx >= 0 ? cols[nameIdx] : cols[0]) || "";
          const phone = (phoneIdx >= 0 ? cols[phoneIdx] : cols[1]) || "";
          const rawGov = govIdx >= 0 ? cols[govIdx] : "";
          const city = (cityIdx >= 0 ? cols[cityIdx] : "") || "Beirut";
          const detailedAddress = (addrIdx >= 0 ? cols[addrIdx] : cols[3]) || "";
          const rawCod = codIdx >= 0 ? cols[codIdx] : "0";
          const rawCurr = (currIdx >= 0 ? cols[currIdx] : "USD").toUpperCase();
          const notes = notesIdx >= 0 ? cols[notesIdx] : "";

          if (!name || !phone || !detailedAddress) {
            errs.push(
              `${lang === "ar" ? "الصف" : "Row"} ${i + 1}: ${
                lang === "ar"
                  ? "الاسم أو الهاتف أو العنوان مفقود"
                  : "Missing name, phone, or address"
              }`
            );
            continue;
          }

          const { governorate, fee } = detectGovernorate(rawGov || city);
          const codAmount = parseFloat(rawCod.replace(/[^0-9.]/g, "")) || 0;
          const codCurrency: "USD" | "LBP" =
            rawCurr.includes("LBP") || rawCurr.includes("ل.ل") ? "LBP" : "USD";

          validParcels.push({
            recipientName: name,
            recipientPhone: phone,
            governorate,
            city,
            detailedAddress,
            codAmount,
            codCurrency,
            deliveryFee: fee,
            notes: notes || undefined,
          });
        }

        if (validParcels.length === 0) {
          setError(
            lang === "ar"
              ? "لم يتم العثور على أسطر صالحة للاستيراد."
              : "No valid rows found to import."
          );
        }

        setParsedRows(validParcels);
        setParseErrors(errs);
      } catch (err: any) {
        setError(`Failed to read file: ${err.message}`);
      }
    };

    reader.readAsText(selectedFile, "UTF-8");
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process bulk upload.");
      }

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans ${
        isRtl ? "font-cairo" : ""
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/merchant/parcels"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition gap-1.5"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            <span>{t("myParcels")}</span>
          </Link>

          <button
            onClick={downloadSampleFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{lang === "ar" ? "تحميل قالب Excel / CSV" : "Download Excel / CSV Template"}</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "استيراد طرود بالجملة (Excel / CSV)" : "Bulk Shipment Import"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === "ar"
                  ? "قم برفع ملف CSV أو Excel لتحويل طلباتك إلى بوالص شحن وتعيين الرسوم تلقائياً."
                  : "Upload a CSV spreadsheet (compatible with Excel) to automatically generate waybills."}
              </p>
            </div>
          </div>

          {importSuccessCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-bold animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {lang === "ar"
                    ? `تم بنجاح استيراد ${importSuccessCount} شحنة وجدولتها في حسابك!`
                    : `Successfully imported ${importSuccessCount} shipments to your queue!`}
                </span>
              </div>
              <Link
                href="/merchant/parcels"
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs hover:bg-emerald-700 transition"
              >
                {lang === "ar" ? "عرض شحناتي" : "View Parcels"}
              </Link>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-3xl p-8 sm:p-12 text-center bg-slate-50/60 hover:bg-blue-50/30 transition cursor-pointer relative group">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 mt-2">
                {lang === "ar" ? "اسحب الملف هنا أو اضغط للاختيار" : "Drag & drop your CSV file here, or browse"}
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                {lang === "ar"
                  ? "يدعم ملفات CSV الصادرة من Excel مع التعرف التلقائي على الأعمدة والمحافظات اللبنانية"
                  : "Supports Excel-exported CSV files with automatic Lebanese governorate detection"}
              </p>
              {file && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-100/70 text-blue-900 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200">
                  <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Parse Errors List */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-900">
              <span className="font-bold block">
                {lang === "ar" ? "تنبيه: تم تجاوز بعض الأسطر غير المكتملة:" : "Notice: Skipped incomplete rows:"}
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {parseErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {parseErrors.length > 3 && (
                  <li>
                    +{parseErrors.length - 3} {lang === "ar" ? "أسطر أخرى" : "more rows skipped"}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {lang === "ar" ? "معاينة الطرود المستخرجة" : "Extracted Shipments Preview"} ({parsedRows.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === "ar"
                      ? "تم حساب أجور التوصيل تلقائياً وفقاً للمحافظة المكتشفة"
                      : "Delivery fees auto-assigned by detected destination governorate"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setFile(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "إلغاء الملف" : "Clear File"}</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-start">{lang === "ar" ? "المستلم" : "Recipient"}</th>
                      <th className="px-4 py-3 text-start">{lang === "ar" ? "الهاتف" : "Phone"}</th>
                      <th className="px-4 py-3 text-start">{lang === "ar" ? "المحافظة والمدينة" : "Governorate & City"}</th>
                      <th className="px-4 py-3 text-start">{lang === "ar" ? "العنوان التفصيلي" : "Address"}</th>
                      <th className="px-4 py-3 text-end">{lang === "ar" ? "مبلغ COD" : "COD"}</th>
                      <th className="px-4 py-3 text-end">{lang === "ar" ? "أجور الشحن" : "Fee"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{row.recipientName}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600" dir="ltr">
                          {row.recipientPhone}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-slate-800">{row.governorate}</span>
                          <span className="text-slate-400 text-[11px] block">{row.city}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate">{row.detailedAddress}</td>
                        <td className="px-4 py-2.5 text-end font-mono font-bold text-slate-900">
                          {row.codCurrency === "USD"
                            ? `$${row.codAmount.toFixed(2)}`
                            : `${row.codAmount.toLocaleString()} LBP`}
                        </td>
                        <td className="px-4 py-2.5 text-end font-mono font-bold text-blue-600">
                          ${row.deliveryFee.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 5 && (
                <p className="text-[11px] text-slate-400 text-center font-medium">
                  +{parsedRows.length - 5}{" "}
                  {lang === "ar" ? "شحنات إضافية جاهزة للتحميل" : "more shipments ready for batch upload"}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20 active:scale-[0.99]"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === "ar" ? "جاري إنشاء بوالص الشحن..." : "Generating Waybills..."}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>
                      {lang === "ar"
                        ? `تأكيد استيراد ${parsedRows.length} شحنة إلى النظام`
                        : `Confirm & Import ${parsedRows.length} Shipments`}
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
