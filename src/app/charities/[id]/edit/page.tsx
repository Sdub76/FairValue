import { getAdminPb } from '@/lib/pocketbase'
import { notFound } from 'next/navigation'
import EditCharityForm from '@/components/feature/EditCharityForm'

export const dynamic = 'force-dynamic'

async function getCharity(id: string) {
    try {
        const pb = await getAdminPb()
        const record = await pb.collection('charities').getOne(id)
        return record
    } catch (e) {
        return null
    }
}

export default async function EditCharityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const charity = await getCharity(id)

    if (!charity) {
        return notFound()
    }

    return <EditCharityForm charity={charity} />
}
