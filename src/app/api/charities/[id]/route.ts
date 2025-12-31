import { getAdminPb } from '@/lib/pocketbase'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const pb = await getAdminPb()
        const body = await request.json()

        await pb.collection('charities').update(id, body)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Charity update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const pb = await getAdminPb()

        await pb.collection('charities').delete(id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Charity delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
