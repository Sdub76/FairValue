'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, LockOpen } from 'lucide-react'
import { toggleTaxYearLock } from '@/app/actions/lock'
import { toast } from 'sonner'

type Props = {
    taxYearId: string
    year: number
    initialLocked: boolean
}

export function TaxYearLockToggle({ taxYearId, year, initialLocked }: Props) {
    const [locked, setLocked] = useState(initialLocked)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        setLoading(true)
        try {
            const newLocked = !locked
            const result = await toggleTaxYearLock(taxYearId, newLocked)

            if (result.success) {
                setLocked(newLocked)
                toast.success(newLocked ? `Tax Year ${year} Locked` : `Tax Year ${year} Unlocked`)
            } else {
                toast.error('Failed to update lock status')
            }
        } catch (e) {
            toast.error('Error toggling lock')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={locked ? "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200" : ""}
            title={locked ? "Unlock Tax Year" : "Lock Tax Year"}
        >
            {locked ? (
                <>
                    <Lock className="mr-2 h-4 w-4" />
                    Locked
                </>
            ) : (
                <>
                    <LockOpen className="mr-2 h-4 w-4" />
                    Unlocked
                </>
            )}
        </Button>
    )
}
