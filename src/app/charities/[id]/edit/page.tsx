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

async function getDonations(charityId: string) {
    try {
        const pb = await getAdminPb()
        const records = await pb.collection('donations').getFullList({
            filter: `charity="${charityId}"`,
            expand: 'tax_year',
        })

        // Fetch items for each donation
        const donationsWithItems = await Promise.all(records.map(async (donation) => {
            const items = await pb.collection('donation_items').getFullList({
                filter: `donation="${donation.id}"`
            })
            return {
                ...donation,
                donation_items: items
            }
        }))

        return donationsWithItems
    } catch (e) {
        return []
    }
}

export default async function EditCharityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const charity = await getCharity(id)
    const donations = await getDonations(id)

    if (!charity) {
        return notFound()
    }

    return <EditCharityForm charity={charity} donations={donations} />
}
