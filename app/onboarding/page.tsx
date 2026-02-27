"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"

export default function OnboardingPage() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadComplete, setUploadComplete] = useState(false)
    const router = useRouter()

    const handleUpload = () => {
        setIsUploading(true)

        // Simulate an upload delay
        setTimeout(() => {
            setIsUploading(false)
            setUploadComplete(true)

            // Save state that user has uploaded data
            localStorage.setItem("opax_data_uploaded", "true")

            // Redirect to main dashboard after a short success message duration
            setTimeout(() => {
                window.location.assign("/")
            }, 1500)
        }, 2000)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="max-w-2xl w-full text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                    Welcome to OpenTax AI
                </h1>
                <p className="text-xl text-muted-foreground">
                    Let's analyze your transactional data to uncover optimization strategies.
                </p>
            </div>

            <Card className="w-full max-w-xl shadow-2xl border-primary/20 bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Upload Financial Data</CardTitle>
                    <CardDescription>
                        Supported formats: Form 16, ITR-V, Bank Statements (CSV/PDF)
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${uploadComplete
                                ? "border-green-500/50 bg-green-500/5"
                                : "border-muted hover:border-primary/50 hover:bg-muted/30 cursor-pointer"}`}
                        onClick={!isUploading && !uploadComplete ? handleUpload : undefined}
                    >
                        {uploadComplete ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                                <h3 className="text-xl font-medium text-foreground">Upload Successful</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Analyzing documents... preparing your dashboard
                                </p>
                            </div>
                        ) : isUploading ? (
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full w-16 h-16 animate-spin" />
                                    <UploadCloud className="h-16 w-16 text-primary p-3" />
                                </div>
                                <h3 className="text-xl font-medium text-foreground mt-6">Processing Data...</h3>
                                <p className="text-sm text-primary mt-2 animate-pulse">
                                    Extracting tax regimes and deductions
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group">
                                <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    Drag & drop files or click to browse
                                </h3>
                                <p className="text-sm text-muted-foreground mx-auto max-w-sm">
                                    Upload your documents securely. Your data remains completely private and is only used for optimization analysis.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pt-2 pb-6">
                    {!uploadComplete && (
                        <Button
                            size="lg"
                            className="w-full max-w-sm transition-all"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Continue with Demo Data"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
