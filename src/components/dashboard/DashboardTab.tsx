"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import type { Candidate } from "@/types/candidate";
import type { Contact } from "@/types/contact";
import type { Company } from "@/types/company";
import type { Opportunity } from "@/types/opportunity";
import type { Pipeline } from "@/types/pipeline";

interface DashboardTabProps {
  candidates: Candidate[];
  contacts: Contact[];
  companies: Company[];
  opportunities: Opportunity[];
  pipelines: Pipeline[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function Sparkline({
  data,
  color,
  height = 40,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = height;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function getMonthlyData(
  records: { created_at?: string }[],
  months = 7
): number[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const m = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - i),
      1
    );
    return records.filter((r) => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      return (
        d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
      );
    }).length;
  });
}

function getPct(arr: number[]): number {
  const last = arr[arr.length - 1] ?? 0;
  const prev = arr[arr.length - 2] ?? 0;
  if (prev === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}

export function DashboardTab({
  candidates,
  contacts,
  companies,
  opportunities,
  pipelines,
}: DashboardTabProps) {
  const candidateData = useMemo(
    () => getMonthlyData(candidates),
    [candidates]
  );
  const contactData = useMemo(() => getMonthlyData(contacts), [contacts]);
  const companyData = useMemo(() => getMonthlyData(companies), [companies]);
  const oppData = useMemo(() => getMonthlyData(opportunities), [opportunities]);

  const wonOpps = opportunities.filter(
    (o) => (o.status ?? "").toLowerCase() === "won"
  ).length;
  const lostOpps = opportunities.filter(
    (o) => (o.status ?? "").toLowerCase() === "lost"
  ).length;
  const openOpps = opportunities.length - wonOpps - lostOpps;
  const winRate =
    opportunities.length > 0
      ? Math.round((wonOpps / opportunities.length) * 100)
      : 0;

  const kpiCards = [
    {
      label: "Total Candidates",
      value: candidates.length,
      data: candidateData,
      color: "#6366f1",
      light: "bg-indigo-50",
      icon: "👤",
    },
    {
      label: "Total Contacts",
      value: contacts.length,
      data: contactData,
      color: "#f59e0b",
      light: "bg-amber-50",
      icon: "👥",
    },
    {
      label: "Companies",
      value: companies.length,
      data: companyData,
      color: "#10b981",
      light: "bg-emerald-50",
      icon: "🏢",
    },
    {
      label: "Opportunities",
      value: opportunities.length,
      data: oppData,
      color: "#ef4444",
      light: "bg-red-50",
      icon: "🎯",
    },
  ];

  const stageData = useMemo(() => {
    const stages: Record<string, number> = {};
    const allStages = (pipelines ?? []).flatMap((p) => p.stages ?? []);
    opportunities.forEach((o) => {
      const stageId = o.stage_id ?? (o as Record<string, unknown>).stageId;
      const stageName =
        allStages.find((s) => String(s.id) === String(stageId))?.name ??
        "Unassigned";
      stages[stageName] = (stages[stageName] ?? 0) + 1;
    });
    return Object.entries(stages).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [opportunities, pipelines]);

  const topSkills = useMemo(() => {
    const skillMap: Record<string, number> = {};
    candidates.forEach((c) => {
      if (c.skills) {
        c.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => (skillMap[s] = (skillMap[s] ?? 0) + 1));
      }
    });
    return Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [candidates]);

  const pieData = [
    { name: "Candidates", value: candidates.length, color: COLORS[0] },
    { name: "Contacts", value: contacts.length, color: COLORS[1] },
    { name: "Companies", value: companies.length, color: COLORS[2] },
    { name: "Opportunities", value: opportunities.length, color: COLORS[3] },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex-1 overflow-auto bg-[#f4f6fb]">
      <div className="bg-white border-b px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Welcome back — live overview of your CRM
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">
              Live Data
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const pct = getPct(card.data);
            const up = pct >= 0;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.light} flex items-center justify-center text-lg`}
                  >
                    {card.icon}
                  </div>
                  <Sparkline data={card.data} color={card.color} />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-0.5">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-gray-400 mb-2">
                  {card.label}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                  >
                    {up ? "↑" : "↓"} {Math.abs(pct)}%
                  </span>
                  <span className="text-[11px] text-gray-400">
                    from last month
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">
              Opportunity stage distribution
            </h3>
            {stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stageData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={70} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-8">No opportunity data yet.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Win / Lost / Open</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Won</span>
                <span className="font-bold text-emerald-600">{wonOpps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lost</span>
                <span className="font-bold text-red-600">{lostOpps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Open</span>
                <span className="font-bold text-blue-600">{openOpps}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Win rate
                  </span>
                  <span className="text-xl font-black text-gray-900">
                    {winRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Top skills (Candidates)</h3>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(({ name, count }) => (
                <span
                  key={name}
                  className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  {name} <span className="text-blue-500">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm max-w-md">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Overview</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
