"use client"

import { AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarchPanicProps {
  onOptimize: () => void
}

export function MarchPanic({ onOptimize }: MarchPanicProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 rounded-xl bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">March Panic Alert</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Risk of last-minute tax panic investing detected. 80C is only 35% utilized.
          </p>
        </div>
      </div>
      <Button
        onClick={onOptimize}
        className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shrink-0"
        size="sm"
      >
        Optimize Now
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
