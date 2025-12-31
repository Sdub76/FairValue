'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/app/actions/settings'
import { logout } from '@/app/actions/auth'

export function PasswordChangeForm() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        const result = await changePassword(formData)

        if (result.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            e.currentTarget.reset()
        }
    }

    async function handleLogout() {
        await logout()
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={6}
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">Password changed successfully!</p>}
                <Button type="submit">Change Password</Button>
            </form>

            <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                </Button>
            </div>
        </div>
    )
}
