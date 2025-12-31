
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

// Types (should be in separate file ideally)
type TaxYear = {
  id: string
  year: number
  target_cpi: number
}

// Force dynamic rendering to ensure data is fresh
export const dynamic = 'force-dynamic'

async function getTaxYears() {
  try {
    const pb = await getAdminPb()
    const records = await pb.collection('tax_years').getFullList()

    // Fetch donations sequentially to avoid autocancellation
    const taxYearsWithTotals = []
    for (const ty of records) {
      const donations = await pb.collection('donations').getFullList({
        filter: `tax_year="${ty.id}"`
      })

      // Fetch items for each donation sequentially
      let totalValue = 0
      for (const donation of donations) {
        const items = await pb.collection('donation_items').getFullList({
          filter: `donation="${donation.id}"`
        })
        const donationTotal = items.reduce((sum: number, item: any) =>
          sum + (parseFloat(item.final_value) || 0), 0)
        totalValue += donationTotal
      }

      taxYearsWithTotals.push({
        ...ty,
        totalValue,
        donationCount: donations.length
      })
    }

    return taxYearsWithTotals as unknown as TaxYear[]
  } catch (e) {
    console.error("Failed to fetch tax years", e)
    return []
  }
}

export default async function DashboardPage() {
  const taxYears = await getTaxYears()

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Add Year Button */}
          <Link href="/donations/new" className="w-full md:w-auto">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Tax Year
            </button>
          </Link>
        </div>
      </div>

      {/* Tax Years Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {taxYears.length === 0 ? (
          <div className="col-span-4 text-center py-10 text-muted-foreground">
            No tax years found. Create one to get started.
          </div>
        ) : (
          taxYears.map((ty: any) => (
            <Link key={ty.id} href={`/donations/${ty.year}`}>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer">
                <div className="p-6 flex flex-col space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">Tax Year {ty.year}</h3>
                  <div className="pt-2 border-t mt-2">
                    <p className="text-lg font-semibold text-primary">{formatCurrency(ty.totalValue || 0)}</p>
                    <p className="text-xs text-muted-foreground">{ty.donationCount || 0} donation events</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
