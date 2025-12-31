
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { Plus, ChevronLeft, Calendar } from "lucide-react"
import { PDFDownloadButton } from "@/components/feature/PDFDownloadButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { notFound } from "next/navigation"
import EditableCPI from "@/components/feature/EditableCPI"

// Force dynamic
export const dynamic = 'force-dynamic'

async function getTaxYear(year: string) {
    try {
        const pb = await getAdminPb()
        // Parse year as integer for proper filtering
        const yearNum = parseInt(year)
        const record = await pb.collection('tax_years').getFirstListItem(`year=${yearNum}`)
        return record
    } catch (e) {
        console.error('Failed to get tax year:', e)
        return null
    }
}

type DonationWithItems = {
    id: string
    name: string
    date: string
    expand?: {
        charity?: { name: string }
    }
    donation_items: {
        final_value: number
    }[]
}

async function getDonations(taxYearId: string): Promise<DonationWithItems[]> {
    try {
        const pb = await getAdminPb()
        const records = await pb.collection('donations').getFullList({
            filter: `tax_year="${taxYearId}"`,
            expand: 'charity',
        })

        // Fetch donation_items sequentially to avoid autocancellation
        const donationsWithItems: DonationWithItems[] = []
        for (const donation of records) {
            const items = await pb.collection('donation_items').getFullList({
                filter: `donation="${donation.id}"`
            })
            donationsWithItems.push({
                ...donation,
                donation_items: items
            } as unknown as DonationWithItems)
        }

        return donationsWithItems
    } catch (e) {
        console.error('Failed to get donations:', e)
        return []
    }
}

export default async function TaxYearPage({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params
    const taxYear = await getTaxYear(year)

    if (!taxYear) {
        return notFound()
    }

    const donations = await getDonations(taxYear.id)
    const multiplier = (taxYear.target_cpi / 313.689).toFixed(4)

    // Calculate summary stats
    const totalDonations = donations.length
    const totalValue = donations.reduce((sum, d) => {
        const donationTotal = d.donation_items?.reduce((itemSum, item) =>
            itemSum + (item.final_value || 0), 0) || 0
        return sum + donationTotal
    }, 0)

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{year} Donations</h2>
                    <EditableCPI taxYear={taxYear} />
                    <p className="text-sm font-medium mt-1">
                        {totalDonations} {totalDonations === 1 ? 'event' : 'events'} • Total Value: ${totalValue.toFixed(2)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <PDFDownloadButton year={year} />
                    <Link href={`/donations/${year}/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Event
                        </Button>
                    </Link>
                </div>
                {totalDonations === 0 && (
                    <form action={async () => {
                        'use server'
                        const { deleteTaxYear } = await import('@/app/actions/delete')
                        await deleteTaxYear(year)
                    }}>
                        <Button variant="destructive" type="submit">
                            Delete Tax Year
                        </Button>
                    </form>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {donations.length === 0 ? (
                    <div className="col-span-3 text-center py-12 border border-dashed rounded-lg bg-muted/10">
                        <h3 className="text-lg font-medium">No donations yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Start by adding a donation event (e.g. "Spring Cleaning Drop-off").
                        </p>
                    </div>
                ) : (
                    donations.map((d: any) => {
                        // Calculate total value for this donation
                        const totalValue = d.donation_items?.reduce((sum: number, item: any) =>
                            sum + (parseFloat(item.final_value) || 0), 0) || 0

                        return (
                            <Link key={d.id} href={`/donations/${year}/${d.id}`}>
                                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg font-medium">{d.name}</CardTitle>
                                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                                                {new Date(d.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardDescription className="flex items-center mt-1">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {d.expand?.charity?.name || "Unknown Charity"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm font-semibold text-primary">
                                            ${totalValue.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {d.donation_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0} items
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
