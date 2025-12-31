import { getAdminPb } from '@/lib/pocketbase'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ year: string }> }
) {
    try {
        const { year } = await params
        const pb = await getAdminPb()
        const body = await request.json()

        // Find tax year by year number
        const yearNum = parseInt(year)
        const taxYear = await pb.collection('tax_years').getFirstListItem(`year=${yearNum}`)

        // Update it
        await pb.collection('tax_years').update(taxYear.id, body)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Tax year update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
