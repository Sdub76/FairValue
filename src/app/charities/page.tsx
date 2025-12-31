
import { getAdminPb } from "@/lib/pocketbase"
import Link from "next/link"
import { Plus, Trash2, Building2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteCharity } from "@/app/actions/charities"

// Force dynamic rendering
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
                    charities.map((charity) => (
                        <Card key={charity.id} className="hover:border-primary transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {charity.name}
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground mb-2">
                                    {charity.ein || "No EIN"}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                    {charity.description || "No description"}
                                </p>
                                <div className="mt-4 flex justify-between gap-2">
                                    <Link href={`/charities/${charity.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <form action={deleteCharity.bind(null, charity.id)}>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
