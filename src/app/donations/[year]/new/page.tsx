
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDonation } from "@/app/actions/donations"
import { ChevronLeft } from "lucide-react"

// Force dynamic
export const dynamic = 'force-dynamic'

async function getCharities() {
    try {
        const pb = await getAdminPb()
        const records = await pb.collection('charities').getFullList()
        return records
    } catch (e) {
        return []
    }
}

async function getTaxYear(year: string) {
    try {
        const pb = await getAdminPb()
        const record = await pb.collection('tax_years').getFirstListItem(`year="${year}"`)
        return record
    } catch (e) {
        return null
    }
}

export default async function NewDonationPage({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params
    const charities = await getCharities()
    const taxYear = await getTaxYear(year)

    if (!taxYear) {
        return <div>Tax Year not found</div>
    }

    const createDonationWithId = createDonation.bind(null, taxYear.id, year)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/donations/${year}`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">New Donation Event</h2>
            </div>

            <form action={createDonationWithId} className="space-y-8">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Goodwill Drop-off" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="charityId">Charity</Label>
                        <select
                            id="charityId"
                            name="charityId"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="">Select a charity...</option>
                            {charities.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="text-xs text-muted-foreground">
                            Don't see it? <Link href="/charities/new" className="underline text-primary">Add new charity</Link>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit">Create Event</Button>
                </div>
            </form>
        </div>
    )
}
