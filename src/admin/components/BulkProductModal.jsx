import { useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { CANONICAL_CATEGORIES, CATEGORY_SUBCATEGORIES, normalizeCategory } from "../../data/categories";
import { formatPrice } from "../../data/product";
import { bulkSaveProducts, getCategoryFallbackImage } from "../../services/storage/adminDataService";
import AdminModal from "./AdminModal";
import { buttonClass } from "./formStyles";

function normalizeImportRow(rawRow) {
  const getVal = (...keys) => {
    for (const k of keys) {
      if (rawRow[k] !== undefined && rawRow[k] !== null && String(rawRow[k]).trim() !== "") {
        return rawRow[k];
      }
      const match = Object.keys(rawRow).find(
        (header) => header.trim().toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "")
      );
      if (match && rawRow[match] !== undefined && rawRow[match] !== null && String(rawRow[match]).trim() !== "") {
        return rawRow[match];
      }
    }
    return "";
  };

  const title = String(getVal("title", "productname", "name")).trim();
  if (!title) return null; // skip empty rows

  const sku = String(getVal("sku", "itemcode", "code")).trim();
  let rawCategory = String(getVal("category", "cat")).trim();
  let category = normalizeCategory(rawCategory);
  if (!category || !CANONICAL_CATEGORIES.includes(category)) {
    category = "Routing";
  }

  const validSubs = CATEGORY_SUBCATEGORIES[category] || [];
  let subcategory = String(getVal("subcategory", "subcat", "sub category")).trim();
  if (!subcategory || !validSubs.includes(subcategory)) {
    subcategory = validSubs[0] || "General";
  }

  const rawCond = String(getVal("condition", "state")).toLowerCase();
  const condition =
    rawCond.includes("used") || rawCond.includes("old") || rawCond.includes("refurb") || rawCond.includes("pre-owned")
      ? "Used Product"
      : "New Product";

  const price = Math.max(0, Number(getVal("price", "rate", "sellingprice")) || 0);
  const rawOldPrice = Number(getVal("oldprice", "compareprice", "mrp"));
  const oldPrice = Number.isFinite(rawOldPrice) && rawOldPrice > price ? rawOldPrice : null;

  const rawStock = Number(getVal("stock", "quantity", "qty"));
  const stock = Number.isInteger(rawStock) && rawStock >= 0 ? rawStock : 10;

  const brand = String(getVal("brand", "company", "manufacturer")).trim() || "Wasooli";
  const image = String(getVal("image", "imageurl", "photo", "img")).trim() || getCategoryFallbackImage(category);
  const shortDescription = String(getVal("shortdescription", "summary", "shortdesc")).trim();
  const description = String(getVal("description", "details", "desc")).trim() || shortDescription || title;
  const portType = String(getVal("porttype", "port", "interface")).trim();

  return {
    title,
    sku,
    category,
    subcategory,
    condition,
    price,
    oldPrice,
    stock,
    brand,
    image,
    shortDescription,
    description,
    portType,
  };
}

export default function BulkProductModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      toast.error("Please upload a valid .csv, .xlsx, or .xls file.");
      return;
    }

    setFile(selectedFile);
    setParseError("");
    setParsedRows([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        setParseError("The uploaded workbook has no sheets.");
        return;
      }
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      if (!rawRows || rawRows.length === 0) {
        setParseError("No rows found in the uploaded file.");
        return;
      }

      const rows = rawRows.map(normalizeImportRow).filter(Boolean);
      if (rows.length === 0) {
        setParseError("No valid products found. Ensure 'Title' and 'Price' headers exist.");
        return;
      }

      setParsedRows(rows);
      toast.info(`${rows.length} product${rows.length > 1 ? "s" : ""} detected in spreadsheet.`);
    } catch (err) {
      console.error("Error reading file:", err);
      setParseError("Could not read spreadsheet: " + (err.message || "Unknown error"));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleDownloadTemplate() {
    const headers = "Title,SKU,Category,Subcategory,Condition,Price,OldPrice,Stock,Brand,ShortDescription";
    const sampleRows = [
      `"MikroTik hEX S SOHO Router","RB760iGS-BULK","Routing","SOHO Home Routers","New Product",14500,16500,25,"MikroTik","5x Gigabit Ethernet Router with SFP port"`,
      `"Cisco Catalyst 2960-X Switch","WS-C2960X-BULK","Switching","Fully Managed Switches","Used Product",38000,45000,12,"Cisco","24x Gigabit Ports + 4x SFP Uplinks"`,
      `"Ubiquiti UniFi U6 Lite AP","U6-LITE-BULK","Wireless","Indoor Access Points","New Product",28500,32000,15,"Ubiquiti","Wi-Fi 6 2x2 Access Point with PoE"`,
      `"Cat6 24-Port Patch Panel","PP-CAT6-24-BULK","Cabling & Connectivity","Copper Patch Panels","New Product",6500,,40,"Wasooli","1U 19-inch Cat6 24-port unshielded patch panel"`,
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(`${headers}\n${sampleRows.join("\n")}\n`);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "wasooli_products_bulk_template.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Sample CSV template downloaded.");
  }

  async function handleStartImport() {
    if (!file) {
      toast.error("Please select a file to import.");
      return;
    }
    if (!parsedRows || parsedRows.length === 0) {
      toast.error("No valid products detected in this file to import.");
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: parsedRows.length });

    try {
      const results = await bulkSaveProducts(parsedRows, (current, total) => {
        setProgress({ current, total });
      });

      if (results.successCount > 0) {
        toast.success(
          `Success! ${results.successCount} product${results.successCount > 1 ? "s" : ""} added to the store!`
        );
        handleClose();
      } else {
        toast.error("Could not import products. Please check the spreadsheet data.");
      }
    } catch (err) {
      toast.error(err.message || "Bulk import failed.");
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    if (importing) return;
    setFile(null);
    setParsedRows([]);
    setParseError("");
    setProgress({ current: 0, total: 0 });
    onClose();
  }

  return (
    <AdminModal
      open={open}
      title="Bulk Import Products (CSV / Excel)"
      onClose={handleClose}
      wide
    >
      <div className="space-y-5">
        {/* Top Description & Sample Template Download */}
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/70 via-white to-brand-50/40 p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-xs">
              <FileSpreadsheet size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Bulk Product Import
              </p>
              <p className="text-xs text-slate-600">
                Upload your product catalog using Excel (.xlsx/.xls) or CSV format to import multiple products at once.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-brand-300 bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-2xs transition hover:bg-brand-50 hover:text-brand-800"
          >
            <Download size={14} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-brand-500 bg-brand-50/60"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {file ? (
            <div className="flex flex-col items-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
                <FileText size={24} />
              </span>
              <p className="mt-2.5 text-sm font-bold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB · Spreadsheet ready
              </p>
              {parsedRows.length > 0 && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 size={14} />
                  <span>{parsedRows.length} product{parsedRows.length > 1 ? "s" : ""} ready to import</span>
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-400">
                Click or drag another file to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-white border border-slate-200 text-brand-600 shadow-2xs group-hover:border-brand-300 group-hover:scale-105 transition-all">
                <UploadCloud size={24} />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-slate-800">
                <span className="text-brand-600 font-bold underline">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Microsoft Excel (.xlsx, .xls) or Comma-Separated Values (.csv) up to 25 MB
              </p>
            </div>
          )}
        </div>

        {/* Parse Error Notification */}
        {parseError && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Live Preview of Parsed Products */}
        {parsedRows.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck size={15} className="text-brand-600" />
                <span>Detected Products ({parsedRows.length})</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Showing preview of first {Math.min(parsedRows.length, 4)} items
              </span>
            </div>
            <div className="divide-y divide-slate-100 overflow-hidden">
              {parsedRows.slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: <span className="font-mono text-slate-700">{p.sku || "Auto"}</span> · {p.category} › {p.subcategory} · <span className={p.condition === "Used Product" ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>{p.condition}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">{formatPrice(p.price)}</p>
                    <p className="text-[11px] text-slate-500">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
            {parsedRows.length > 4 && (
              <p className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
                + {parsedRows.length - 4} more products will be imported
              </p>
            )}
          </div>
        )}

        {/* Import Progress Bar */}
        {importing && (
          <div className="space-y-1.5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
              <span>Importing products to database...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-200">
              <div
                className="h-full bg-brand-600 transition-all duration-300 ease-out"
                style={{
                  width: `${progress.total ? Math.round((progress.current / progress.total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Column Guidelines Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-brand-600" />
            <span>Supported Spreadsheet Headers</span>
          </p>
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">Title <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-500">Product name</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">SKU</span>
              <span className="text-[11px] text-slate-500">Auto-generated if empty</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">Category & Subcategory</span>
              <span className="text-[11px] text-slate-500">Official catalog categories</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">Price <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-500">Selling price in PKR</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">OldPrice</span>
              <span className="text-[11px] text-slate-500">Compare-at price</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-200/80 p-2">
              <span className="font-semibold text-slate-900 block">Stock & Condition</span>
              <span className="text-[11px] text-slate-500">Quantity, New / Used</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartImport}
            disabled={!file || parsedRows.length === 0 || importing}
            className={`${buttonClass} inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {importing ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Importing {progress.current} of {progress.total}...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>
                  {parsedRows.length > 0
                    ? `Upload & Import ${parsedRows.length} Product${parsedRows.length > 1 ? "s" : ""}`
                    : "Upload & Import Products"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
