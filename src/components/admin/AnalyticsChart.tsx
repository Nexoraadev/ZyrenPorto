"use client";

import { useState } from "react";
import { BarChart2, ChevronLeft, ChevronRight } from "lucide-react";

interface MonthData {
  month:  number; // 1–12
  year:   number;
  count:  number;
  paths:  Record<string, number>;
}

interface AnalyticsChartProps {
  data:         MonthData[];
  availableYears: number[];
  totalViews:   number;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export function AnalyticsChart({ data, availableYears, totalViews }: AnalyticsChartProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const years = availableYears.length > 0 ? availableYears : [currentYear];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years, currentYear);

  // Build 12-month array for selected year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const found = data.find(d => d.year === year && d.month === i + 1);
    return { month: i + 1, count: found?.count ?? 0, paths: found?.paths ?? {} };
  });

  const maxCount  = Math.max(...monthlyData.map(m => m.count), 1);
  const yearTotal = monthlyData.reduce((s, m) => s + m.count, 0);

  // Top pages for selected year
  const allPaths: Record<string, number> = {};
  monthlyData.forEach(m => {
    Object.entries(m.paths).forEach(([p, c]) => {
      allPaths[p] = (allPaths[p] ?? 0) + c;
    });
  });
  const topPages = Object.entries(allPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxPageCount = topPages[0]?.[1] ?? 1;

  return (
    <div id="analytics" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono text-dark-500 uppercase tracking-widest flex items-center gap-2">
          <BarChart2 size={13} className="text-blood-600" />
          Pengunjung per Bulan
        </h2>
        <span className="text-[10px] font-mono text-dark-700">
          Total all-time: <span className="text-dark-400">{totalViews.toLocaleString()}</span>
        </span>
      </div>

      <div className="card-dark rounded-xl border border-dark-800 p-5">
        {/* Year picker */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setYear(y => Math.max(minYear, y - 1))}
            disabled={year <= minYear}
            className="p-1 rounded text-dark-600 hover:text-dark-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-dark-200">{year}</span>
            <span className="text-[10px] font-mono text-dark-600 bg-dark-900 border border-dark-800 px-2 py-0.5 rounded-full">
              {yearTotal.toLocaleString()} views
            </span>
          </div>

          <button
            onClick={() => setYear(y => Math.min(maxYear, y + 1))}
            disabled={year >= maxYear}
            className="p-1 rounded text-dark-600 hover:text-dark-300 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Bar chart — 12 months */}
        <div className="flex items-end gap-1.5 h-28">
          {monthlyData.map(({ month, count }) => {
            const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 6) : 2;
            const isCurrentMonth = year === currentYear && month === new Date().getMonth() + 1;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                {count > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-dark-900 border border-dark-800 text-[9px] font-mono text-dark-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {count}
                  </span>
                )}
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    background: count > 0
                      ? isCurrentMonth
                        ? "linear-gradient(to top, #0891b2, #22d3ee)"
                        : "linear-gradient(to top, #155e75, #06b6d4)"
                      : "#1a1a1a",
                    opacity: isCurrentMonth ? 1 : 0.8,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Month labels */}
        <div className="flex gap-1.5 mt-2">
          {MONTH_LABELS.map((label, i) => {
            const isCurrentMonth = year === currentYear && i + 1 === new Date().getMonth() + 1;
            return (
              <div key={label} className={`flex-1 text-center text-[9px] font-mono ${isCurrentMonth ? "text-blood-500" : "text-dark-700"}`}>
                {label}
              </div>
            );
          })}
        </div>

        {/* Top pages */}
        {topPages.length > 0 && (
          <div className="mt-5 pt-4 border-t border-dark-800">
            <p className="text-[10px] font-mono text-dark-600 mb-3 uppercase tracking-widest">
              Halaman terpopuler {year}
            </p>
            <div className="space-y-2">
              {topPages.map(([path, count]) => (
                <div key={path} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-dark-500 flex-1 truncate">{path || "/"}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blood-700 rounded-full"
                        style={{ width: `${(count / maxPageCount) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-dark-500 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {yearTotal === 0 && (
          <p className="text-center text-xs font-mono text-dark-700 mt-2">
            {`// belum ada data untuk tahun ${year}`}
          </p>
        )}
      </div>
    </div>
  );
}
