import { getAdminPb } from '@/lib/pocketbase'
import { notFound } from 'next/navigation'
import EditTaxYearForm from '@/components/feature/EditTaxYearForm'

export const dynamic = 'force-dynamic'

async function getTaxYear(year: string) {
    try {
        const pb = await getAdminPb()
        const yearNum = parseInt(year)
        const record = await pb.collection('tax_years').getFirstListItem(`year=${yearNum}`)
        return record
    } catch (e) {
        return null
    }
}

export default async function EditTaxYearPage({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params
    const taxYear = await getTaxYear(year)

    if (!taxYear) {
        return notFound()
    }

    return <EditTaxYearForm taxYear={taxYear} />
}
