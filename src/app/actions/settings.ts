'use server'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { revalidatePath } from 'next/cache'

export async function changePassword(formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    try {
        const { getConfig, updateConfig } = await import('@/lib/config')
        const config = getConfig()

        // Verify current password
        if (config.app?.password !== currentPassword) {
            return { error: 'Current password is incorrect' }
        }

        // Update password
        config.app.password = newPassword

        // Write back to file
        updateConfig(config)

        revalidatePath('/settings')
        return { success: true }
    } catch (e) {
        console.error("Failed to change password", e)
        return { error: 'Failed to update password' }
    }
}
