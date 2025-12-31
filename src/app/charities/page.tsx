
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getCharities() {
    try {
        const pb = await getAdminPb()
        const charities = await pb.collection('charities').getFullList()

        // Fetch donations for each charity
        const charitiesWithDonations = await Promise.all(charities.map(async (charity) => {
            const donations = await pb.collection('donations').getFullList({
                filter: `charity="${charity.id}"`,
                expand: 'tax_year',
                requestKey: `charity-${charity.id}` // Unique key to prevent auto-cancellation
            })

            // Fetch items for each donation in smaller batches
            const donationsWithItems = []
            for (const donation of donations) {
                const items = await pb.collection('donation_items').getFullList({
                    filter: `donation="${donation.id}"`,
                    requestKey: `donation-items-${donation.id}` // Unique key to prevent auto-cancellation
                })
                donationsWithItems.push({
                    ...donation,
                    donation_items: items
                })
            }

            // Group by year and calculate totals
            const yearlyTotals: Record<number, number> = {}
            donationsWithItems.forEach((donation: any) => {
                const year = donation.expand?.tax_year?.year
                if (year) {
                    const totalValue = donation.donation_items?.reduce((sum: number, item: any) =>
                        sum + (parseFloat(item.final_value) || 0), 0) || 0
                    yearlyTotals[year] = (yearlyTotals[year] || 0) + totalValue
                }
            })

            return {
                ...charity,
                yearlyTotals
            }
        }))

        return charitiesWithDonations
    } catch (e) {
        console.error('Error fetching charities:', e)
        return []
    }
}

export default async function CharitiesPage() {
    const charities = await getCharities()

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Charities</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/charities/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Charity
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {charities.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-muted-foreground">
                        No charities found. Add one to start tracking donations.
                    </div>
                ) : (
                    charities.map((charity: any) => (
                        <Link key={charity.id} href={`/charities/${charity.id}/edit`}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {charity.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mb-2">
                                        {charity.ein || "No EIN"}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                        {charity.description || "No description"}
                                    </p>
                                    {Object.keys(charity.yearlyTotals || {}).length > 0 && (
                                        <div className="text-xs space-y-1 pt-2 border-t">
                                            {Object.entries(charity.yearlyTotals)
                                                .sort(([a], [b]) => parseInt(b as string) - parseInt(a as string))
                                                .map(([year, total]: [string, any]) => (
                                                    <div key={year} className="flex justify-between">
                                                        <span className="text-muted-foreground">{year}:</span>
                                                        <span className="font-medium">${total.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
