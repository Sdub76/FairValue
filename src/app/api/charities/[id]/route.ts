import { getAdminPb } from '@/lib/pocketbase'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const pb = await getAdminPb()
        const body = await request.json()

        await pb.collection('charities').update(params.id, body)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
