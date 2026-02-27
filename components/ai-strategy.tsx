"use client"

import { Sparkles, TrendingUp, Shield, Landmark, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts"

const timelineSteps = [
  {
    period: "Month 1-2",
    title: "Start SIP in ELSS",
    description: "Begin a monthly SIP of \u20B95,000 in a tax-saving ELSS fund for Section 80C benefits with potential for high returns.",
    amount: "\u20B95,000/month",
    icon: TrendingUp,
    color: "bg-primary",
  },
  {
    period: "Month 3",
    title: "Buy Health Insurance",
    description: "Secure comprehensive health coverage of \u20B920,000 for Section 80D deduction. Cover self and parents for maximum benefit.",
    amount: "\u20B920,000",
    icon: Shield,
    color: "bg-success",
  },
  {
    period: "Month 4-6",
    title: "Invest in PPF",
    description: "Allocate \u20B910,000 monthly to Public Provident Fund for safe, tax-free returns under Section 80C.",
    amount: "\u20B910,000/month",
    icon: Landmark,
    color: "bg-chart-3",
  },
]

const projectionData = [
  { year: "2024", income: 1200000, threshold: 1200000 },
  { year: "2025", income: 1320000, threshold: 1200000 },
  { year: "2026", income: 1450000, threshold: 1200000 },
  { year: "2027", income: 1590000, threshold: 1200000 },
]

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
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

export function AIStrategy() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Strategy Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your personalized 6-month optimization blueprint
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-xl border-glass-border bg-card/50 hover:bg-card/70 text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate Strategy
          <Sparkles className="w-4 h-4 text-primary" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
        <h3 className="text-sm font-semibold text-foreground mb-8">6-Month Optimization Timeline</h3>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="flex flex-col gap-8">
            {timelineSteps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-5 pl-0">
                <div className={`relative z-10 w-10 h-10 rounded-full ${step.color} flex items-center justify-center shrink-0`}>
                  <step.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 rounded-xl border border-glass-border bg-secondary/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-medium text-primary uppercase tracking-widest">
                      {step.period}
                    </span>
                    <span className="text-xs font-mono font-medium text-success">
                      {step.amount}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future Tax Projection */}
      <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground">Future Tax Projection</h3>
          <p className="text-xs text-muted-foreground mt-0.5">3-year income growth and regime threshold</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.2 265)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.2 265)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.01 270)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.6 0.01 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={1200000}
                stroke="oklch(0.75 0.15 85)"
                strokeDasharray="8 4"
                label={{
                  value: "Regime Threshold",
                  position: "insideTopRight",
                  fill: "oklch(0.75 0.15 85)",
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Projected Income"
                stroke="oklch(0.55 0.2 265)"
                strokeWidth={2}
                fill="url(#projGrad)"
              />
              <ReferenceDot
                x="2025"
                y={1320000}
                r={6}
                fill="oklch(0.55 0.2 265)"
                stroke="oklch(0.13 0.005 270)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
            <span className="text-sm font-medium text-warning">
              At {"\u20B9"}12L income, New Regime becomes more efficient
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
