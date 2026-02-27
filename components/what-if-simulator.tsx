"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { AnimatedNumber } from "./animated-number"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-glass-border bg-popover/95 backdrop-blur-md p-3 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-xs text-muted-foreground">
            {p.name}: <span className="text-foreground font-medium">{"\u20B9"}{p.value.toLocaleString("en-IN")}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function WhatIfSimulator() {
  const [investments, setInvestments] = useState({
    section80c: 90000,
    section80d: 15000,
    nps: 25000,
    salaryGrowth: 8,
  })

  const totalDeductions = investments.section80c + investments.section80d + investments.nps
  const taxSavedOld = Math.round(totalDeductions * 0.3)
  const taxSavedNew = Math.round(totalDeductions * 0.05)
  const maxGap = 150000 + 50000 + 50000 - totalDeductions
  const savingsGap = Math.max(0, maxGap)

  const chartData = [
    { name: "80C", value: investments.section80c, max: 150000 },
    { name: "80D", value: investments.section80d, max: 50000 },
    { name: "NPS", value: investments.nps, max: 50000 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">What-If Simulator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust your investments and see real-time tax impact
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6 flex flex-col gap-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Investment Controls</h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">80C Investment</label>
              <span className="text-sm font-mono font-medium text-foreground">
                {"\u20B9"}{investments.section80c.toLocaleString("en-IN")}
              </span>
            </div>
            <Slider
              value={[investments.section80c]}
              onValueChange={([v]) => setInvestments((p) => ({ ...p, section80c: v }))}
              min={0}
              max={150000}
              step={5000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{"\u20B9"}0</span>
              <span>{"\u20B9"}1,50,000</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">80D Insurance</label>
              <span className="text-sm font-mono font-medium text-foreground">
                {"\u20B9"}{investments.section80d.toLocaleString("en-IN")}
              </span>
            </div>
            <Slider
              value={[investments.section80d]}
              onValueChange={([v]) => setInvestments((p) => ({ ...p, section80d: v }))}
              min={0}
              max={50000}
              step={2500}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{"\u20B9"}0</span>
              <span>{"\u20B9"}50,000</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">NPS Contribution</label>
              <span className="text-sm font-mono font-medium text-foreground">
                {"\u20B9"}{investments.nps.toLocaleString("en-IN")}
              </span>
            </div>
            <Slider
              value={[investments.nps]}
              onValueChange={([v]) => setInvestments((p) => ({ ...p, nps: v }))}
              min={0}
              max={50000}
              step={2500}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{"\u20B9"}0</span>
              <span>{"\u20B9"}50,000</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Expected Salary Growth</label>
              <span className="text-sm font-mono font-medium text-foreground">
                {investments.salaryGrowth}%
              </span>
            </div>
            <Slider
              value={[investments.salaryGrowth]}
              onValueChange={([v]) => setInvestments((p) => ({ ...p, salaryGrowth: v }))}
              min={0}
              max={25}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
            </div>
          </div>
        </div>

        {/* Live Results */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Tax Saved (Old)</span>
              <AnimatedNumber
                value={taxSavedOld}
                prefix={"\u20B9"}
                className="block text-2xl font-bold text-success mt-2"
              />
            </div>
            <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Tax Saved (New)</span>
              <AnimatedNumber
                value={taxSavedNew}
                prefix={"\u20B9"}
                className="block text-2xl font-bold text-chart-3 mt-2"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Savings Gap Remaining</span>
            <AnimatedNumber
              value={savingsGap}
              prefix={"\u20B9"}
              className="block text-2xl font-bold text-warning mt-2"
            />
            <div className="mt-3 h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-500"
                style={{ width: `${Math.min(100, (totalDeductions / 250000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">Invested</span>
              <span className="text-[10px] text-muted-foreground">{"\u20B9"}2,50,000 limit</span>
            </div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5 flex-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">Investment Allocation</span>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.01 270)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.2 0.01 270 / 0.5)" }} />
                  <Bar dataKey="max" fill="oklch(0.2 0.01 270)" radius={[0, 6, 6, 0]} barSize={16} />
                  <Bar dataKey="value" fill="oklch(0.55 0.2 265)" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
