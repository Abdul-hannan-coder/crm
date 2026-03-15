"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  User,
  Copy,
  Mail,
  Phone,
  Linkedin,
  GripVertical,
  ChevronDown,
  Briefcase,
  GraduationCap,
  Plus,
} from "lucide-react";
import { formatHeader } from "@/lib/table-config";
import type { TableModule } from "@/lib/table-config";

export interface RecordDetailViewProps {
  activeTab: TableModule;
  selectedItem: Record<string, unknown> & { id: string };
  setSelectedItem: (item: unknown) => void;
  triggerDelete: (payload: {
    type: string;
    id: string;
    name: string;
    collection: string;
    item: unknown;
  }) => void;
  showNotification?: (message: string, type: "success" | "error" | "info") => void;
  onOpenResumePreview?: (url: string) => void;
}

function copyToClipboard(text: string, showNotification?: (m: string, t: "success" | "error" | "info") => void) {
  if (!text) return;
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showNotification?.("Copied to clipboard!", "success");
  } catch (_err) {}
  document.body.removeChild(ta);
}

function renderDetailField(
  label: string,
  value: string | number | undefined | null,
  formatHeaderFn: (h: string) => string
) {
  const display = value != null && value !== "" ? String(value) : "—";
  return (
    <div key={label} className="py-2 border-b border-gray-50 last:border-0">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {formatHeaderFn(label)}
      </div>
      <div className="text-sm text-gray-800">{display}</div>
    </div>
  );
}

function parseWorkHistory(raw: unknown): Array<{ description?: string; title?: string; company?: string; date?: string; role?: string; position?: string; organization?: string; employer?: string; duration?: string; period?: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Array<{ description?: string; title?: string; company?: string; date?: string }>;
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [{ description: raw }];
    } catch {
      const entries = raw.split(/(?<=\)),\s*/).filter((e: string) => e.trim());
      if (entries.length > 1) {
        return entries.map((entry) => {
          const m = entry.match(/^(.+?)\s+at\s+(.+?)\s*(\([^)]+\))?$/);
          return m
            ? { title: m[1]?.trim(), company: m[2]?.trim(), date: m[3]?.replace(/[()]/g, "").trim() }
            : { description: entry.trim() };
        });
      }
      return [{ description: raw }];
    }
  }
  return [];
}

function parseEducationHistory(raw: unknown): Array<{ description?: string; degree?: string; field?: string; institution?: string; year?: string; qualification?: string; title?: string; school?: string; university?: string; college?: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Array<{ description?: string; degree?: string; institution?: string; year?: string }>;
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [{ description: raw }];
    } catch {
      const entries = raw.split(/;\s*/).filter((e: string) => e.trim());
      if (entries.length > 1) {
        return entries.map((entry) => {
          const parts = entry.split(",").map((p) => p.trim());
          const yr = entry.match(/\b(19|20)\d{2}\b/);
          const year = yr ? yr[0] : "";
          const np = parts.filter((p) => !p.match(/^\d{4}$/));
          return {
            degree: np[0] || entry,
            field: np[1] || "",
            institution: np.slice(2, -1).join(", ") || np[np.length - 1] || "",
            year,
          };
        });
      }
      return [{ description: raw }];
    }
  }
  return [];
}

export function RecordDetailView({
  activeTab,
  selectedItem,
  setSelectedItem,
  triggerDelete,
  showNotification,
  onOpenResumePreview,
}: RecordDetailViewProps) {
  const [detailActiveTab, setDetailActiveTab] = useState("All Details");

  const entityLabel = activeTab === "candidates" ? "Candidate" : activeTab === "contacts" ? "Contact" : "Company";
  const name = (selectedItem.name ?? selectedItem.firstName ?? "Unknown Name") as string;
  const position = (selectedItem.position_title ?? selectedItem.positionTitle ?? selectedItem.job_title ?? selectedItem.jobTitle ?? selectedItem.title ?? "NOT ASSIGNED") as string;
  const locality = (selectedItem.locality ?? selectedItem.city ?? "Not available") as string;
  const email = (selectedItem.email ?? "No email provided") as string;
  const phone = (selectedItem.phone ?? selectedItem.contactNumber ?? "No phone provided") as string;
  const owner = (selectedItem.owner ?? "AI Parser") as string;
  const linkedinUrl = (selectedItem.linkedin_profile_url ?? selectedItem.linkedinProfileUrl) as string | undefined;

  const workList = parseWorkHistory(selectedItem.work_history ?? selectedItem.workHistory);
  const eduList = parseEducationHistory(selectedItem.education_history ?? selectedItem.educationHistory);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f6f8] overflow-y-auto">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="hover:text-blue-600 flex items-center gap-1 font-medium mr-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="capitalize">{entityLabel}</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium text-gray-800 capitalize">{activeTab}</span>
          <span className="text-gray-400">•</span>
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-100">
            ID - {String(selectedItem.id).slice(0, 8)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Request Updated Profile
          </button>
          <button
            type="button"
            onClick={() =>
              triggerDelete({
                type: "single",
                id: selectedItem.id,
                name: name,
                collection: activeTab,
                item: selectedItem,
              })
            }
            className="border border-red-200 bg-red-50 text-red-600 p-1.5 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-6 max-w-[1200px] w-full mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
              <User size={40} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                {linkedinUrl && String(linkedinUrl) !== "Not Available" && (
                  <a
                    href={String(linkedinUrl).startsWith("http") ? String(linkedinUrl) : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin size={16} className="text-blue-600 cursor-pointer" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <span className="uppercase tracking-wide font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {position}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  Locality: <span className="text-gray-800 font-medium">{locality}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer hover:underline"
              onClick={() => copyToClipboard(email, showNotification)}
            >
              <Mail size={16} /> {email} <Copy size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer hover:underline"
              onClick={() => copyToClipboard(phone, showNotification)}
            >
              <Phone size={16} /> {phone} <Copy size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-gray-600 ml-auto">
              <User size={16} /> <span className="font-medium text-gray-800">{owner}</span>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 bg-white px-2 rounded-t-xl overflow-x-auto">
          <div className="flex space-x-8 px-4">
            {["All Details", "Assigned Jobs", "Related Emails", "History"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDetailActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${detailActiveTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {detailActiveTab === "All Details" && (
          <div className="space-y-6 pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6 cursor-pointer group">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <GripVertical size={16} className="text-gray-300" />{" "}
                  {activeTab === "contacts" ? "Contact Details" : "Candidate Details"}
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 pl-6">
                <div className="flex flex-col">
                  {renderDetailField("name", selectedItem.name as string, formatHeader)}
                  {renderDetailField("phone", (selectedItem.contactNumber ?? selectedItem.phone) as string, formatHeader)}
                  {renderDetailField("city", selectedItem.city as string, formatHeader)}
                  {renderDetailField("state", selectedItem.state as string, formatHeader)}
                  {renderDetailField("country", selectedItem.country as string, formatHeader)}
                  {renderDetailField("position_title", (selectedItem.position_title ?? selectedItem.positionTitle ?? selectedItem.job_title) as string, formatHeader)}
                  {renderDetailField("current_organization", (selectedItem.current_organization ?? selectedItem.currentOrganization ?? selectedItem.company_name) as string, formatHeader)}
                </div>
                <div className="flex flex-col">
                  {renderDetailField("email", selectedItem.email as string, formatHeader)}
                  {renderDetailField("locality", selectedItem.locality as string, formatHeader)}
                  {renderDetailField("gender", selectedItem.gender as string, formatHeader)}
                  {renderDetailField("linkedin_profile_url", (selectedItem.linkedin_profile_url ?? selectedItem.linkedinProfileUrl) as string, formatHeader)}
                  {activeTab === "candidates" && renderDetailField("total_experience", (selectedItem.total_experience ?? selectedItem.totalExperience) as string, formatHeader)}
                  {activeTab === "candidates" && renderDetailField("skills", selectedItem.skills as string, formatHeader)}
                  {activeTab === "candidates" && (
                    <div className="py-2 border-b border-gray-50 last:border-0">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                        Resume
                      </div>
                      <div className="text-sm">
                        {selectedItem.resume ? (
                          onOpenResumePreview ? (
                            <button
                              type="button"
                              onClick={() => onOpenResumePreview(String(selectedItem.resume))}
                              className="text-blue-600 hover:underline text-left"
                            >
                              View resume
                            </button>
                          ) : (
                            <a
                              href={String(selectedItem.resume)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View resume
                            </a>
                          )
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {activeTab === "candidates" && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <GripVertical size={16} className="text-gray-300" />
                      <Briefcase size={18} className="text-gray-400" /> Work History
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm"
                    >
                      <Plus size={14} /> Add Experience
                    </button>
                  </div>
                  <div className="space-y-3 pl-2">
                    {workList.length > 0 ? (
                      workList.map((work, i) =>
                        work.description ? (
                          <div
                            key={i}
                            className="text-sm text-gray-600 border border-gray-100 rounded-lg p-4 leading-relaxed bg-gray-50"
                          >
                            {work.description}
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all bg-white flex gap-3"
                          >
                            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Briefcase size={16} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start flex-wrap gap-1">
                                <h4 className="text-[14px] font-bold text-gray-800">
                                  {(work.title ?? work.role ?? work.position) || "Title N/A"}
                                </h4>
                                {work.date && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                    {work.date}
                                  </span>
                                )}
                              </div>
                              <p className="text-[13px] font-semibold text-blue-600 mt-0.5">
                                {(work.company ?? work.organization ?? work.employer) ?? ""}
                              </p>
                              {(work.duration ?? work.period) && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {work.duration ?? work.period}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg text-sm">
                        No work history available.
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <GripVertical size={16} className="text-gray-300" />
                      <GraduationCap size={18} className="text-gray-400" /> Education
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm"
                    >
                      <Plus size={14} /> Add Education
                    </button>
                  </div>
                  <div className="space-y-3 pl-2">
                    {eduList.length > 0 ? (
                      eduList.map((edu, i) =>
                        edu.description ? (
                          <div
                            key={i}
                            className="text-sm text-gray-600 border border-gray-100 rounded-lg p-4 leading-relaxed bg-gray-50"
                          >
                            {edu.description}
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all bg-white flex gap-3"
                          >
                            <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                              <GraduationCap size={16} className="text-violet-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start flex-wrap gap-1">
                                <h4 className="text-[14px] font-bold text-gray-800">
                                  {(edu.degree ?? edu.qualification ?? edu.title) || "Degree N/A"}
                                </h4>
                                {edu.year && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                    {edu.year}
                                  </span>
                                )}
                              </div>
                              <p className="text-[13px] font-semibold text-violet-600 mt-0.5">
                                {(edu.institution ?? edu.school ?? edu.university ?? edu.college) ?? ""}
                              </p>
                              {edu.field && (
                                <p className="text-xs text-gray-500 mt-0.5">📚 {edu.field}</p>
                              )}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg text-sm">
                        No education data available.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {detailActiveTab !== "All Details" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-500 text-sm">
              {detailActiveTab} content will be available in a future update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
