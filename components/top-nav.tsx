"use client"

import { Bell, FileDown, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavProps {
  onGenerateReport: () => void
  onMenuToggle: () => void
}

export function TopNav({ onGenerateReport, onMenuToggle }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-secondary text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-xs">O</span>
            </div>
            <span className="font-bold text-foreground">OPAX</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-sm text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
            <span>FY 2024-25</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <button className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">AK</span>
          </div>

          <Button
            onClick={onGenerateReport}
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            size="sm"
          >
            <FileDown className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>
    </header>
  )
}
