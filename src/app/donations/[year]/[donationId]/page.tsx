
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { ChevronLeft, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PhotoGallery } from "@/components/feature/PhotoGallery"
import { ItemsTable } from "@/components/feature/ItemsTable"
import { notFound } from "next/navigation"

// Types
type Donation = {
    id: string
    collectionId: string
    name: string
    date: string
    photos: string[]
    expand: {
        charity?: { name: string }
        tax_year?: { target_cpi: number, year: number }
    }
}

type Item = {
    id: string
    name: string
    category: string
    quantity: number
    final_value: number
    value_type: string
}

export const dynamic = 'force-dynamic'

async function getDonation(id: string) {
    try {
        const pb = await getAdminPb()
        const record = await pb.collection('donations').getOne(id, {
            expand: 'charity,tax_year',
        })
        return record as unknown as Donation
    } catch (e) {
        return null
    }
}

async function getItems(donationId: string) {
    try {
        const pb = await getAdminPb()
        const records = await pb.collection('donation_items').getFullList({
            filter: `donation="${donationId}"`,
        })
        return records as unknown as Item[]
    } catch (e) {
        return []
    }
}

export default async function DonationPage({ params }: { params: Promise<{ year: string, donationId: string }> }) {
    const { year, donationId } = await params
    const donation = await getDonation(donationId)
    const items = await getItems(donationId)

    if (!donation) return notFound()

    const taxYearCpi = donation.expand.tax_year?.target_cpi || 313.689 // Fallback
    const totalValue = items.reduce((sum, item) => sum + item.final_value, 0)

    // Determine PB URL for client side images
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:28090'

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/donations/${year}`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{donation.name}</h2>
                    <div className="flex items-center text-muted-foreground text-sm space-x-4">
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(donation.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            {donation.expand.charity?.name || "Unknown Charity"}
                        </span>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Items Table */}
                    <ItemsTable
                        donationId={donation.id}
                        taxYearCpi={taxYearCpi}
                        items={items}
                        totalValue={totalValue}
                    />
                </div>

                <div className="space-y-6">
                    {/* Photos */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <PhotoGallery
                            donationId={donation.id}
                            existingPhotos={donation.photos}
                            pocketbaseUrl={pbUrl}
                            collectionId={donation.collectionId || "donations"} // collectionId is usually on the record
                        // record.collectionId is 'donations' or ID. SDK usually returns it.
                        // I should verify if generic Donation type has it. Yes, PB records have collectionId.
                        />
                        {/* We need collectionId for the image URL construction */}
                    </div>

                    {/* Summary Card */}
                    <div className="rounded-xl border bg-muted/40 p-6 space-y-2">
                        <h3 className="font-medium">Valuation Summary</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Baseline Year</span>
                            <span>2024 (CPI 313.689)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax Year {year}</span>
                            <span>CPI {taxYearCpi}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Value</span>
                            <span>${totalValue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
