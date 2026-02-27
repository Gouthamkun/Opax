"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { TopNav } from "@/components/top-nav"
import { OverviewCards } from "@/components/overview-cards"
import { RegimeComparison } from "@/components/regime-comparison"
import { HealthScore } from "@/components/health-score"
import { MarchPanic } from "@/components/march-panic"
import { WhatIfSimulator } from "@/components/what-if-simulator"
import { TransactionIntelligence } from "@/components/transaction-intelligence"
import { AIStrategy } from "@/components/ai-strategy"
import { ReportModal } from "@/components/report-modal"
import { AIBubble } from "@/components/ai-bubble"

export default function OpaxDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication and onboarding status continuously 
    const isAuthenticated = localStorage.getItem("opax_authenticated") === "true"
    const hasDataUploaded = localStorage.getItem("opax_data_uploaded") === "true"

    if (!isAuthenticated) {
      router.push("/login")
    } else if (!hasDataUploaded) {
      router.push("/onboarding")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onGenerateReport={() => setReportOpen(true)}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === "simulator" && <WhatIfSimulator />}
          {(activeTab === "tax-optimizer" || activeTab === "financial-health") && (
            <TransactionIntelligence />
          )}
          {activeTab === "ai-strategy" && <AIStrategy />}
          {activeTab === "reports" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Reports</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Generate comprehensive tax optimization reports
                </p>
              </div>
              <button
                onClick={() => setReportOpen(true)}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
              >
                Generate Report
              </button>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Configuration and preferences coming soon
              </p>
            </div>
          )}
        </main>
      </div>

      <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
      <AIBubble />
    </div>
  )
}

function DashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Good morning, Akhil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {"Here's"} your tax optimization overview for FY 2024-25
        </p>
      </div>

      {/* March Panic */}
      <MarchPanic onOptimize={() => onNavigate("simulator")} />

      {/* Overview Cards */}
      <OverviewCards />

      {/* Regime + Health */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <RegimeComparison />
        </div>
        <div className="xl:col-span-2">
          <HealthScore />
        </div>
      </div>
    </div>
  )
}
