"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileText,
  BarChart3,
  Brain,
  Heart,
  Scale,
  CheckCircle,
} from "lucide-react"

const sections = [
  { icon: FileText, label: "Income Summary", status: "Ready" },
  { icon: BarChart3, label: "Deduction Gap Analysis", status: "Ready" },
  { icon: Scale, label: "Regime Comparison", status: "Ready" },
  { icon: Brain, label: "AI Strategy Plan", status: "Ready" },
  { icon: Heart, label: "Financial Health Score", status: "Ready" },
]

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-glass-border backdrop-blur-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Generate Tax Report
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your comprehensive tax optimization report preview
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {sections.map((section) => (
            <div
              key={section.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-glass-border"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <section.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                {section.label}
              </span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success">{section.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-glass-border text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
