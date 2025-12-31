'use server'

import { getAdminPb } from '@/lib/pocketbase'

export async function searchBaseline(query: string) {
    const pb = await getAdminPb()

    try {
        const results = await pb.collection('baseline_items').getFullList({
            filter: `name ~ "${query}" || category ~ "${query}"`,
        })

        return results
    } catch (error) {
        console.error('Search failed:', error)
        return []
    }
}

export async function getBaselineCategories() {
    const pb = await getAdminPb()

    try {
        const items = await pb.collection('baseline_items').getFullList()
        const categories = [...new Set(items.map((item: any) => item.category))].sort()
        return categories
    } catch (error) {
        console.error('Failed to get categories:', error)
        return []
    }
}

export async function getItemsByCategory(category: string) {
    const pb = await getAdminPb()

    try {
        const items = await pb.collection('baseline_items').getFullList({
            filter: `category = "${category}"`,
        })
        return items
    } catch (error) {
        console.error('Failed to get items:', error)
        return []
    }
}
