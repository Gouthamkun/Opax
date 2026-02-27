"use client"

import { useState } from "react"
import { Sparkles, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIBubble() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-80 rounded-2xl border border-glass-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">OPAX AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 h-48 flex flex-col justify-end gap-3">
            <div className="self-start max-w-[85%] rounded-xl rounded-bl-none bg-secondary/50 p-3">
              <p className="text-xs text-foreground leading-relaxed">
                Hello! I can help you optimize your taxes. Try asking me about Section 80C investments or regime comparison.
              </p>
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2">
              <input
                type="text"
                placeholder="Ask about tax optimization..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-primary to-chart-3 hover:scale-105",
          open && "rotate-0"
        )}
      >
        {open ? (
          <X className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        )}
      </button>
    </div>
  )
}
