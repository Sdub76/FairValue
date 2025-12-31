import { getAdminPb } from '@/lib/pocketbase'
import { notFound } from 'next/navigation'
import EditDonationForm from '@/components/feature/EditDonationForm'

export const dynamic = 'force-dynamic'

async function getDonation(donationId: string) {
    try {
        const pb = await getAdminPb()
        const record = await pb.collection('donations').getOne(donationId, {
            expand: 'charity,tax_year'
        })
        return record
    } catch (e) {
        return null
    }
}

async function getCharities() {
    try {
        const pb = await getAdminPb()
        const records = await pb.collection('charities').getFullList()
        return records
    } catch (e) {
        return []
    }
}

export default async function EditDonationPage({ params }: { params: Promise<{ year: string, donationId: string }> }) {
    const { year, donationId } = await params
    const donation = await getDonation(donationId)
    const charities = await getCharities()

    if (!donation) {
        return notFound()
    }

    return <EditDonationForm donation={donation} charities={charities} year={year} />
}
