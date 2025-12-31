'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function EditTaxYearForm({ taxYear }: { taxYear: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch(`/api/tax-years/${taxYear.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_cpi: parseFloat(formData.get('target_cpi') as string),
                }),
            })

            if (response.ok) {
                router.push('/')
                router.refresh()
            } else {
                alert('Failed to update tax year')
            }
        } catch (error) {
            alert('Error updating tax year')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Tax Year {taxYear.year}</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Year Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                value={taxYear.year}
                                disabled
                            />
                            <p className="text-xs text-muted-foreground mt-1">Year cannot be changed</p>
                        </div>

                        <div>
                            <Label htmlFor="target_cpi">Target CPI *</Label>
                            <Input
                                id="target_cpi"
                                name="target_cpi"
                                type="number"
                                step="0.001"
                                defaultValue={taxYear.target_cpi}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">Consumer Price Index for this tax year</p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href="/">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
