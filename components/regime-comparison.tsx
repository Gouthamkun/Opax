"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Switch } from "@/components/ui/switch"

const dataOld = [
  { name: "Gross Income", old: 1200000, new: 1200000 },
  { name: "Deductions", old: 250000, new: 75000 },
  { name: "Taxable", old: 950000, new: 1125000 },
  { name: "Tax Payable", old: 82500, new: 131250 },
]

const dataNew = [
  { name: "Gross Income", old: 1200000, new: 1200000 },
  { name: "Deductions", old: 250000, new: 75000 },
  { name: "Taxable", old: 950000, new: 1125000 },
  { name: "Tax Payable", old: 82500, new: 131250 },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-glass-border bg-popover/95 backdrop-blur-md p-3 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-xs text-muted-foreground">
            {p.dataKey === "old" ? "Old Regime" : "New Regime"}:{" "}
            <span className="text-foreground font-medium">
              {"\u20B9"}{p.value.toLocaleString("en-IN")}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function RegimeComparison() {
  const [showNew, setShowNew] = useState(false)
  const data = showNew ? dataNew : dataOld

  return (
    <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Regime Comparison</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Old vs New Tax Regime Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${!showNew ? "text-primary" : "text-muted-foreground"}`}>
            Old Regime
          </span>
          <Switch checked={showNew} onCheckedChange={setShowNew} />
          <span className={`text-xs font-medium ${showNew ? "text-chart-3" : "text-muted-foreground"}`}>
            New Regime
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.01 270)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${"\u20B9"}${(v / 100000).toFixed(1)}L`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.2 0.01 270 / 0.5)" }} />
            <Bar dataKey="old" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill="oklch(0.55 0.2 265)" fillOpacity={showNew ? 0.3 : 1} />
              ))}
            </Bar>
            <Bar dataKey="new" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill="oklch(0.7 0.15 195)" fillOpacity={showNew ? 1 : 0.3} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
          <span className="text-sm font-medium text-success">
            You save {"\u20B9"}48,750 more in Old Regime
          </span>
        </div>
      </div>
    </div>
  )
}
