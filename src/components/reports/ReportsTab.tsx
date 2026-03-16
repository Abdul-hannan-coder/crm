"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useDeals } from "@/hooks/useDeals";
import type { Opportunity } from "@/types/opportunity";
import type { Pipeline } from "@/types/pipeline";
import type { Candidate } from "@/types";

interface ReportsTabProps {
  opportunities?: Opportunity[];
  candidates?: Candidate[];
  pipelines?: Pipeline[];
}

const STAGE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

function getStageCounts(
  opportunities: Opportunity[],
  pipelines: Pipeline[]
): { name: string; value: number; color: string }[] {
  const stageIdToName: Record<string, string> = {};
  pipelines.forEach((p) => {
    (p.stages ?? []).forEach((s, i) => {
      stageIdToName[String(s.id)] = s.name ?? `Stage ${i + 1}`;
    });
  });
  const counts: Record<string, number> = {};
  opportunities.forEach((o) => {
    const stageId = o.stage_id ?? (o as Record<string, unknown>).stageId;
    const name = stageId
      ? stageIdToName[String(stageId)] ?? "Unassigned"
      : "Unassigned";
    counts[name] = (counts[name] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name], i) => ({
    name,
    value: counts[name],
    color: STAGE_COLORS[i % STAGE_COLORS.length],
  }));
}

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pct = (percent * 100).toFixed(1);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-medium"
    >
      {name}: {pct}%
    </text>
  );
}

export function ReportsTab({ opportunities = [], candidates = [], pipelines = [] }: ReportsTabProps = {}) {
  const { deals } = useDeals();

  const pipelineDonutData = useMemo(
    () => getStageCounts(opportunities, pipelines),
    [opportunities, pipelines]
  );

  const totalInPipeline = pipelineDonutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Candidates</p>
          <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Opportunities</p>
          <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Deals</p>
          <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">New Report</h2>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Total Candidates In Pipeline
        </h3>
        {pipelineDonutData.length > 0 ? (
          <div className="flex flex-wrap items-center gap-8">
            <ResponsiveContainer width={320} height={280}>
              <PieChart>
                <Pie
                  data={pipelineDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props) => (
                    <CustomLabel
                      {...props}
                      name={props.name}
                      percent={(props as { percent?: number }).percent ?? (totalInPipeline ? props.value / totalInPipeline : 0)}
                    />
                  )}
                >
                  {pipelineDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    value,
                    totalInPipeline
                      ? `${((value / totalInPipeline) * 100).toFixed(1)}%`
                      : "",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[180px]">
              {pipelineDonutData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm text-gray-700 truncate">{d.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-6">
            No pipeline data yet. Add pipelines and opportunities to see the
            report.
          </p>
        )}
      </div>
    </div>
  );
}
