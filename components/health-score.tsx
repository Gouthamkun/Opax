"use client"

import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"

const breakdowns = [
  { label: "80C Utilization", value: 72, color: "bg-primary" },
  { label: "80D Coverage", value: 45, color: "bg-chart-3" },
  { label: "NPS Optimization", value: 30, color: "bg-warning" },
  { label: "Diversification Index", value: 68, color: "bg-success" },
]

export function HealthScore() {
  const [score, setScore] = useState(0)
  const target = 62

  useEffect(() => {
    const timer = setTimeout(() => setScore(target), 100)
    return () => clearTimeout(timer)
  }, [])

  const circumference = 2 * Math.PI * 80
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-6">
      <h3 className="text-base font-semibold text-foreground mb-6">Financial Health Score</h3>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="oklch(0.2 0.01 270)"
              strokeWidth="10"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-[1500ms] ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.55 0.2 265)" />
                <stop offset="100%" stopColor="oklch(0.7 0.15 195)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className="text-xs text-muted-foreground">out of 100</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {breakdowns.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-medium text-foreground">{item.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          You can improve your score by optimizing {"\u20B9"}60,000 under Section 80C. Consider ELSS or PPF investments.
        </p>
      </div>
    </div>
  )
}
