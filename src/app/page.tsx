"use client";

import { db } from "@/lib/db";
import { type AppSchema } from "@/instant.schema";
import { InstaQLEntity } from "@instantdb/react";

type CDS = InstaQLEntity<AppSchema, "cds">;

function App() {
  // Read Data from CDS namespace
  const { isLoading, error, data } = db.useQuery({ cds: {} });

  if (isLoading) {
    return <div className="text-gray-500 p-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }
  const { cds } = data;

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Admissions Overview</h1>
            <p className="text-gray-400 text-sm tracking-wider">
              {cds.length} {cds.length === 1 ? 'INSTITUTION' : 'INSTITUTIONS'}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 text-sm">
            InstantDB Sync Active
          </div>
        </div>
        <CDSTable cds={cds} />
      </div>
    </div>
  );
}

// Components
// ----------
function CDSTable({ cds }: { cds: CDS[] }) {
  if (cds.length === 0) {
    return (
      <div className="text-gray-400 text-center p-8 bg-[#1a1f2e] rounded-2xl border border-gray-700">
        No CDS data available. Add some data to the "cds" namespace in InstantDB.
      </div>
    );
  }

  // Define specific columns in order
  const columns = [
    { key: "University Name", label: "University Name" },
    { key: "Total Applicants", label: "Total Applicants" },
    { key: "Admitted", label: "Admitted" },
  ];

  // Find the maximum total applicants for scaling
  const maxApplicants = Math.max(
    ...cds.map((item) => {
      const total = item["Total Applicants" as keyof CDS];
      return typeof total === "number" ? total : 0;
    })
  );

  return (
    <div className="bg-[#1a1f2e] rounded-2xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visualization
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {cds.map((item) => (
              <tr key={item.id} className="hover:bg-[#232937] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-white">
                    {formatValue(item[col.key as keyof CDS])}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <BarChart
                    admitted={
                      typeof item["Admitted" as keyof CDS] === "number"
                        ? (item["Admitted" as keyof CDS] as number)
                        : 0
                    }
                    totalApplicants={
                      typeof item["Total Applicants" as keyof CDS] === "number"
                        ? (item["Total Applicants" as keyof CDS] as number)
                        : 0
                    }
                    maxApplicants={maxApplicants}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarChart({
  admitted,
  totalApplicants,
  maxApplicants,
}: {
  admitted: number;
  totalApplicants: number;
  maxApplicants: number;
}) {
  // Calculate bar width as percentage of max applicants
  const barWidth = maxApplicants > 0 ? (totalApplicants / maxApplicants) * 100 : 0;
  // Calculate admitted width as percentage of total applicants within the bar
  const admittedPercentage = totalApplicants > 0 ? (admitted / totalApplicants) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="h-8 bg-gray-700 rounded-md overflow-hidden relative" style={{ width: `${barWidth}%` }}>
        {/* Total Applicants bar (custom red) - full width of container */}
        <div
          className="absolute h-full transition-all"
          style={{
            width: '100%',
            backgroundColor: '#ab3030'
          }}
        />
        {/* Admitted bar (custom green) - percentage of total */}
        <div
          className="absolute h-full transition-all"
          style={{
            width: `${admittedPercentage}%`,
            backgroundColor: '#40b35b'
          }}
        />
      </div>
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

export default App;
