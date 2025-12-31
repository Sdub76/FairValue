'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function EditCharityForm({ charity, donations }: { charity: any, donations: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch(`/api/charities/${charity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    address: formData.get('address'),
                    ein: formData.get('ein'),
                }),
            })

            if (response.ok) {
                router.push('/charities')
                router.refresh()
            } else {
                alert('Failed to update charity')
            }
        } catch (error) {
            alert('Error updating charity')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this charity?')) return

        try {
            const response = await fetch(`/api/charities/${charity.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                router.push('/charities')
                router.refresh()
            } else {
                alert('Failed to delete charity')
            }
        } catch (error) {
            alert('Error deleting charity')
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/charities">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Charity</h2>
                </div>
                {donations.length === 0 && (
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete Charity
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Charity Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Organization Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={charity.name}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="ein">EIN (Tax ID)</Label>
                            <Input
                                id="ein"
                                name="ein"
                                placeholder="12-3456789"
                                defaultValue={charity.ein}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={charity.description}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={charity.address}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href="/charities">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {donations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Associated Donation Events ({donations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Tax Year</th>
                                        <th className="px-4 py-3 text-left font-medium">Date</th>
                                        <th className="px-4 py-3 text-right font-medium">Total Items</th>
                                        <th className="px-4 py-3 text-right font-medium">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map((donation: any) => {
                                        const totalItems = donation.donation_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
                                        const totalValue = donation.donation_items?.reduce((sum: number, item: any) =>
                                            sum + (parseFloat(item.final_value) || 0), 0) || 0

                                        return (
                                            <tr key={donation.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3">{donation.expand?.tax_year?.year || 'N/A'}</td>
                                                <td className="px-4 py-3">{new Date(donation.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right">{totalItems}</td>
                                                <td className="px-4 py-3 text-right font-medium">${totalValue.toFixed(2)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
