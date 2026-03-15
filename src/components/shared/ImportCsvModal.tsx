"use client";

import { useState, useRef } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import { formatHeader } from "@/lib/table-config";
import type { TableModule } from "@/lib/table-config";

/** Simple CSV parse: handles quoted fields with commas. */
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        i++;
        let cell = "";
        while (i < line.length) {
          if (line[i] === '"') {
            i++;
            if (line[i] === '"') {
              cell += '"';
              i++;
            } else break;
          } else {
            cell += line[i];
            i++;
          }
        }
        out.push(cell);
        if (line[i] === ",") i++;
      } else {
        const comma = line.indexOf(",", i);
        if (comma === -1) {
          out.push(line.slice(i).trim());
          break;
        }
        out.push(line.slice(i, comma).trim());
        i = comma + 1;
      }
    }
    return out;
  };
  const headers = parseLine(lines[0] ?? "");
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TableModule;
  getAllHeaders: () => string[];
  onExecuteImport: (rows: Record<string, string>[]) => Promise<void>;
  isImporting?: boolean;
}

export function ImportCsvModal({
  isOpen,
  onClose,
  activeTab,
  getAllHeaders,
  onExecuteImport,
  isImporting = false,
}: ImportCsvModalProps) {
  const [step, setStep] = useState(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titleLabel =
    activeTab === "candidates"
      ? "Candidates"
      : activeTab === "contacts"
        ? "Contacts"
        : "Companies";

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvData(rows);
      setFieldMapping(
        headers.reduce(
          (acc, h) => ({ ...acc, [h]: "" }),
          {} as Record<string, string>
        )
      );
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".csv")) {
      setCsvFile(file);
      processFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) {
      setCsvFile(file);
      processFile(file);
    }
  };

  const handleExecute = async () => {
    const crmHeaders = getAllHeaders();
    const rows: Record<string, string>[] = csvData.map((row) => {
      const record: Record<string, string> = {};
      csvHeaders.forEach((csvH, idx) => {
        const crmField = fieldMapping[csvH];
        if (crmField && crmHeaders.includes(crmField)) {
          record[crmField] = row[idx] ?? "";
        }
      });
      return record;
    });
    const validRows = rows.filter((r) => Object.keys(r).length > 0);
    await onExecuteImport(validRows);
    setStep(1);
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setFieldMapping({});
    onClose();
  };

  const handleClose = () => {
    if (!isImporting) {
      setStep(1);
      setCsvFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[80]">
      {step === 1 ? (
        <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-full overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b">
            <h3 className="text-lg font-bold text-gray-800">
              Import {titleLabel}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50"
                );
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 mb-4 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              <Upload size={40} className="text-blue-400 mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Drag & Drop your CSV here
              </p>
              <p className="text-xs text-gray-400">or click to browse files</p>
              {csvFile && (
                <p className="text-sm text-emerald-600 mt-3 font-medium flex items-center gap-1">
                  <CheckCircle2 size={16} /> {csvFile.name}
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0" />{" "}
                  File format must be CSV.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0" />{" "}
                  First row must be column headers.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0" />{" "}
                  Date format: e.g. 17 Jan 1991.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-full flex flex-col h-[80vh] overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Map Fields for {titleLabel}
              </h3>
              <p className="text-sm text-gray-500">
                Map file columns to CRM fields.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="grid grid-cols-2 px-6 py-3 bg-slate-100 border-b font-bold text-sm text-gray-700">
                <div>CSV Headers (with example)</div>
                <div>CRM Fields</div>
              </div>
              <div className="divide-y divide-gray-100">
                {csvHeaders.map((header, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-2 px-6 py-3 items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {header}{" "}
                      <span className="text-gray-400 font-normal">
                        (
                        {csvData[0]?.[idx] != null
                          ? String(csvData[0][idx]).substring(0, 20)
                          : "No data"}
                        )
                      </span>
                    </div>
                    <div>
                      <select
                        value={fieldMapping[header] ?? ""}
                        onChange={(e) =>
                          setFieldMapping((prev) => ({
                            ...prev,
                            [header]: e.target.value,
                          }))
                        }
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${!fieldMapping[header] ? "text-gray-500 border-gray-300" : "text-gray-800 border-blue-300 font-medium"}`}
                      >
                        <option value="">Don&apos;t Import This Column</option>
                        {getAllHeaders().map((crmHeader) => (
                          <option key={crmHeader} value={crmHeader}>
                            {formatHeader(crmHeader)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2 text-sm font-bold text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isImporting}
              className="px-6 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Importing..." : "Import Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
