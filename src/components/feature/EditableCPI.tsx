'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Edit, Check, X } from 'lucide-react'

export default function EditableCPI({ taxYear, locked }: { taxYear: any, locked?: boolean }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [cpiValue, setCpiValue] = useState(taxYear.target_cpi.toString())
    const [loading, setLoading] = useState(false)

    async function handleSave() {
        setLoading(true)
        try {
            const response = await fetch(`/api/tax-years/${taxYear.year}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_cpi: parseFloat(cpiValue) }),
            })

            if (response.ok) {
                setIsEditing(false)
                router.refresh()
            } else {
                alert('Failed to update CPI')
            }
        } catch (error) {
            alert('Error updating CPI')
        } finally {
            setLoading(false)
        }
    }

    function handleCancel() {
        setCpiValue(taxYear.target_cpi.toString())
        setIsEditing(false)
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">CPI:</span>
                <Input
                    type="number"
                    step="0.001"
                    value={cpiValue}
                    onChange={(e) => setCpiValue(e.target.value)}
                    className="w-32 h-8"
                    disabled={loading}
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleSave}
                    disabled={loading}
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
                CPI: {taxYear.target_cpi} • Reference Database Multiplier: {(taxYear.target_cpi / 313.689).toFixed(4)}x
            </span>
            {!locked && (
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                >
                    <Edit className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}
