"use client"

import { TrendingUp, Gauge, PiggyBank, Scale } from "lucide-react"
import { AnimatedNumber } from "./animated-number"

const cards = [
  {
    title: "Tax Saved",
    value: 84500,
    prefix: "\u20B9",
    suffix: "",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
    description: "This financial year",
  },
  {
    title: "Tax Efficiency Score",
    value: 62,
    prefix: "",
    suffix: "/100",
    icon: Gauge,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "Room for improvement",
  },
  {
    title: "Savings Gap",
    value: 65500,
    prefix: "\u20B9",
    suffix: "",
    icon: PiggyBank,
    color: "text-warning",
    bg: "bg-warning/10",
    description: "Remaining to optimize",
  },
  {
    title: "Recommended Regime",
    value: 0,
    prefix: "",
    suffix: "",
    icon: Scale,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    description: "Old Regime saves more",
    customDisplay: "Old Regime",
  },
]

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group relative rounded-2xl border border-glass-border bg-card/50 backdrop-blur-md p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/70"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              {card.customDisplay ? (
                <span className={`text-2xl font-bold ${card.color}`}>
                  {card.customDisplay}
                </span>
              ) : (
                <AnimatedNumber
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  className={`text-2xl font-bold ${card.color}`}
                />
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{card.description}</p>
        </div>
      ))}
    </div>
  )
}
