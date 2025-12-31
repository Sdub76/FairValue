'use server'

import { getAdminPb } from "@/lib/pocketbase"

export async function searchBaseline(term: string) {
    if (!term) return []
    try {
        const pb = await getAdminPb()
        // Use fullList with filter for MVP. Limit to 50.
        // PB filter: name ~ 'term'
        const records = await pb.collection('baseline_items').getList(1, 50, {
            filter: `name ~ "${term}" || category ~ "${term}" || tags ~ "${term}"`,
        })
        return records.items.map((r) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            value_low_2024: r.value_low_2024,
            value_high_2024: r.value_high_2024,
        }))
    } catch (e) {
        return []
    }
}
