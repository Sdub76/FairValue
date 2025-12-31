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

export default function EditDonationForm({ donation, charities, year }: { donation: any, charities: any[], year: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch(`/api/donations/${donation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    date: formData.get('date'),
                    charity: formData.get('charity'),
                    notes: formData.get('notes'),
                }),
            })

            if (response.ok) {
                router.push(`/donations/${year}/${donation.id}`)
                router.refresh()
            } else {
                alert('Failed to update donation')
            }
        } catch (error) {
            alert('Error updating donation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4">
                <Link href={`/donations/${year}/${donation.id}`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Donation Event</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Event Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={donation.name}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={donation.date.split(' ')[0]}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="charity">Charity</Label>
                            <select
                                id="charity"
                                name="charity"
                                defaultValue={donation.charity}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select a charity</option>
                                {charities.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={donation.notes || ''}
                                placeholder="Add any additional notes about this donation..."
                                className="mt-1"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href={`/donations/${year}/${donation.id}`}>
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
