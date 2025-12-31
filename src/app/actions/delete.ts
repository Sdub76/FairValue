'use server'

import { getAdminPb } from '@/lib/pocketbase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteTaxYear(year: string) {
    try {
        const pb = await getAdminPb()

        // Find the tax year
        const yearNum = parseInt(year)
        const taxYear = await pb.collection('tax_years').getFirstListItem(`year=${yearNum}`)

        // Delete it
        await pb.collection('tax_years').delete(taxYear.id)

        revalidatePath('/')
        redirect('/')
    } catch (error) {
        console.error('Failed to delete tax year:', error)
        throw error
    }
}

export async function deleteDonationEvent(donationId: string, year: string) {
    try {
        const pb = await getAdminPb()

        // Delete the donation
        await pb.collection('donations').delete(donationId)

        revalidatePath(`/donations/${year}`)
        redirect(`/donations/${year}`)
    } catch (error) {
        console.error('Failed to delete donation:', error)
        throw error
    }
}
