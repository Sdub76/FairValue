'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCharity } from "@/app/actions/charities"
import { AddressAutocomplete } from "@/components/feature/AddressAutocomplete"

export default function NewCharityForm({ apiKey }: { apiKey?: string }) {
    const [address, setAddress] = useState('')

    return (
        <form action={createCharity} className="space-y-8">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Goodwill Industries" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Brief notes about what they accept..." />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    {/* Headless Radar Autocomplete Integration */}
                    <input type="hidden" name="address" value={address} />
                    <AddressAutocomplete
                        value={address}
                        onSelect={(addr) => setAddress(addr)}
                        apiKey={apiKey}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="ein">EIN (Tax ID)</Label>
                    <Input id="ein" name="ein" placeholder="e.g. 12-3456789" />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">Save Charity</Button>
            </div>
        </form>
    )
}
