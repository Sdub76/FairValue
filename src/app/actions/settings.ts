'use server'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { revalidatePath } from 'next/cache'

export async function changePassword(formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    const configPath = path.join(process.cwd(), 'config', 'config.yaml')

    try {
        const fileContents = fs.readFileSync(configPath, 'utf8')
        const data = yaml.load(fileContents) as any

        // Verify current password
        if (data?.app?.password !== currentPassword) {
            return { error: 'Current password is incorrect' }
        }

        // Update password
        data.app.password = newPassword

        // Write back to file
        fs.writeFileSync(configPath, yaml.dump(data), 'utf8')

        revalidatePath('/settings')
        return { success: true }
    } catch (e) {
        console.error("Failed to change password", e)
        return { error: 'Failed to update password' }
    }
}
