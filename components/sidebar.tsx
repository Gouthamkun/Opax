"use client"

import {
  LayoutDashboard,
  Calculator,
  Heart,
  SlidersHorizontal,
  Brain,
  FileText,
  Settings,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Calculator, label: "Tax Optimizer", id: "tax-optimizer" },
  { icon: Heart, label: "Financial Health", id: "financial-health" },
  { icon: SlidersHorizontal, label: "What-If Simulator", id: "simulator" },
  { icon: Brain, label: "AI Strategy Plan", id: "ai-strategy" },
  { icon: FileText, label: "Reports", id: "reports" },
  { icon: Settings, label: "Settings", id: "settings" },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <span className="text-primary-foreground font-bold text-sm">O</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">OPAX</h1>
          <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wider uppercase">OpenTax AI</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Running Locally &ndash; Privacy First</span>
        </div>
      </div>
    </aside>
  )
}
