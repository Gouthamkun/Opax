"use client"

import { Lightbulb } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const monthlyData = [
  { month: "Apr", income: 100000, expenses: 62000, savings: 38 },
  { month: "May", income: 100000, expenses: 58000, savings: 42 },
  { month: "Jun", income: 100000, expenses: 70000, savings: 30 },
  { month: "Jul", income: 105000, expenses: 63000, savings: 40 },
  { month: "Aug", income: 105000, expenses: 55000, savings: 48 },
  { month: "Sep", income: 105000, expenses: 68000, savings: 35 },
  { month: "Oct", income: 110000, expenses: 60000, savings: 45 },
  { month: "Nov", income: 110000, expenses: 72000, savings: 35 },
  { month: "Dec", income: 115000, expenses: 65000, savings: 43 },
  { month: "Jan", income: 115000, expenses: 58000, savings: 50 },
  { month: "Feb", income: 115000, expenses: 62000, savings: 46 },
  { month: "Mar", income: 120000, expenses: 68000, savings: 43 },
]

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-glass-border bg-popover/95 backdrop-blur-md p-3 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: <span className="text-foreground font-medium">{typeof p.value === "number" && p.name !== "Savings Rate" ? `\u20B9${p.value.toLocaleString("en-IN")}` : `${p.value}%`}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function TransactionIntelligence() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Smart Transaction Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive analysis of your income, spending, and savings patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Savings Rate</span>
          <p className="text-3xl font-bold text-success mt-2">40.5%</p>
          <p className="text-xs text-muted-foreground mt-1">Healthy range</p>
        </div>
        <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Discretionary Spend</span>
          <p className="text-3xl font-bold text-warning mt-2">24%</p>
          <p className="text-xs text-muted-foreground mt-1">Below threshold</p>
        </div>
        <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Surplus</span>
          <p className="text-3xl font-bold text-primary mt-2">{"\u20B9"}42,000</p>
          <p className="text-xs text-muted-foreground mt-1">Available for investment</p>
        </div>
      </div>

      {/* Income vs Expenses chart */}
      <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Income vs Expenses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.2 265)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.2 265)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.15 195)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.7 0.15 195)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.01 270)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="oklch(0.55 0.2 265)"
                strokeWidth={2}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="oklch(0.7 0.15 195)"
                strokeWidth={2}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Savings Rate Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.01 270)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings Rate"
                stroke="oklch(0.65 0.18 165)"
                strokeWidth={2}
                dot={{ r: 3, fill: "oklch(0.65 0.18 165)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">AI Insight</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            You can comfortably invest {"\u20B9"}12,000 per month without affecting your lifestyle. Consider allocating this towards ELSS for tax benefits.
          </p>
        </div>
      </div>
    </div>
  )
}
