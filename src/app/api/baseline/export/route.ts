import { NextResponse } from 'next/server'
import { getAdminPb } from '@/lib/pocketbase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const pb = await getAdminPb()

        // Fetch all baseline items
        const items = await pb.collection('baseline_items').getFullList({
            sort: 'category,name'
        })

        // Create CSV header
        const csvRows = [
            'Category,Description,HQVal,MQVal'
        ]

        // Add data rows
        for (const item of items) {
            const category = (item.category || '').replace(/,/g, ';') // Escape commas
            const description = (item.name || '').replace(/,/g, ';')
            const hqVal = item.value_high_2024 || 0
            const mqVal = item.value_low_2024 || 0

            csvRows.push(`${category},${description},${hqVal},${mqVal}`)
        }

        const csvContent = csvRows.join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="valuation_baseline_2024.csv"'
            }
        })
    } catch (error) {
        console.error('Error generating CSV:', error)
        return NextResponse.json(
            { error: 'Failed to generate CSV' },
            { status: 500 }
        )
    }
}
