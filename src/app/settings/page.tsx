
import { getAdminPb } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { revalidatePath } from "next/cache"
import { PasswordChangeForm } from "@/components/feature/PasswordChangeForm"
import { ModeToggle } from "@/components/mode-toggle"

// Dynamic because we fetch data
export const dynamic = 'force-dynamic'

async function getBaselineStats() {
    try {
        const pb = await getAdminPb()
        // Just get count and first 5 items
        const result = await pb.collection('baseline_items').getList(1, 5)
        return result
    } catch (e) {
        return { totalItems: 0, items: [] }
    }
}


export default async function SettingsPage() {
    const data = await getBaselineStats()

    return (
        <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Valuation Baseline (2024)</CardTitle>
                        <CardDescription>
                            Total Items: {data.totalItems || 0} (Showing first 5)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Value (Low)</TableHead>
                                    <TableHead>Value (High)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>${item.value_low_2024}</TableCell>
                                        <TableCell>${item.value_high_2024}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">Showing top 5 items only.</p>
                            <Button asChild variant="outline" size="sm">
                                <a href="/api/baseline/export" download>
                                    Export Full Baseline CSV
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Manage your password and session</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordChangeForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the application theme</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                            <span>Theme Preference</span>
                            <span className="text-xs text-muted-foreground">Switch between light and dark mode</span>
                        </div>
                        <ModeToggle />
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
