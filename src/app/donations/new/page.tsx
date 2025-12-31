
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTaxYear } from "@/app/actions/donations"
import { ChevronLeft, ExternalLink } from "lucide-react"

export default function NewTaxYearPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">New Tax Year</h2>
            </div>

            <form action={createTaxYear} className="space-y-8">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="year">Tax Year</Label>
                        <Input id="year" name="year" type="number" placeholder="e.g. 2025" required defaultValue={new Date().getFullYear()} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="target_cpi">Target CPI</Label>
                            <a href="https://www.bls.gov/cpi/tables/supplemental-files/historical-cpi-u-202410.pdf" target="_blank" className="text-xs text-primary flex items-center hover:underline">
                                Lookup BLS Data <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </div>
                        <Input id="target_cpi" name="target_cpi" type="number" step="0.001" placeholder="e.g. 315.23" required />
                        <p className="text-xs text-muted-foreground">
                            Enter the CPI-U value for the tax year (or estimate). Baseline 2024 is 313.689.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit">Create Tax Year</Button>
                </div>
            </form>
        </div>
    )
}
