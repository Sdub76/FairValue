'use server'

import { getAdminPb } from "@/lib/pocketbase"
import { revalidatePath } from "next/cache"

export async function toggleTaxYearLock(taxYearId: string, locked: boolean) {
    try {
        const pb = await getAdminPb()

        await pb.collection('tax_years').update(taxYearId, {
            locked: locked
        })

        revalidatePath(`/donations/${taxYearId}`) // Revalidate the specific year page if the path used ID, but usually it uses year number.
        // Better revalidate widely or specifically if we know the year number. 
        // Logic suggests we might need to pass the year number or revalidate just the generic path.
        revalidatePath('/donations/[year]', 'page')

        return { success: true }
    } catch (e) {
        console.error('Failed to toggle lock:', e)
        return { success: false, error: e }
    }
}
