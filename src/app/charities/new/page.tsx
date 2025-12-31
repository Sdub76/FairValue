
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCharity } from "@/app/actions/charities"
import { ChevronLeft } from "lucide-react"

export default function NewCharityPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/charities">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Add Charity</h2>
            </div>

            <form action={createCharity} className="space-y-8">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Goodwill Industries" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="ein">EIN (Tax ID)</Label>
                        <Input id="ein" name="ein" placeholder="e.g. 12-3456789" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" name="address" placeholder="123 Charity Lane..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Brief notes about what they accept..." />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit">Save Charity</Button>
                </div>
            </form>
        </div>
    )
}
