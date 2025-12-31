import { NextRequest, NextResponse } from 'next/server'
import { getAdminPb } from '@/lib/pocketbase'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ year: string }> }
) {
    try {
        const params = await context.params
        const year = parseInt(params.year)
        const pb = await getAdminPb()

        // Fetch tax year
        const taxYear = await pb.collection('tax_years').getFirstListItem(`year=${year}`)

        // Fetch all charities
        const charities = await pb.collection('charities').getFullList({
            sort: 'name'
        })

        // Build data structure for PDF
        const charitiesData = []
        let totalValue = 0
        let donationCount = 0
        let totalItemCount = 0

        for (const charity of charities) {
            // Fetch donations for this charity in this tax year
            const donations = await pb.collection('donations').getFullList({
                filter: `charity="${charity.id}" && tax_year="${taxYear.id}"`,
                sort: 'date',
                requestKey: `pdf-charity-${charity.id}`
            })

            const donationsData = []
            for (const donation of donations) {
                donationCount++

                // Fetch items
                const items = await pb.collection('donation_items').getFullList({
                    filter: `donation="${donation.id}"`,
                    requestKey: `pdf-donation-${donation.id}`
                })

                totalItemCount += items.reduce((sum, item) => sum + item.quantity, 0)
                const donationValue = items.reduce((sum, item) => sum + item.final_value, 0)
                totalValue += donationValue

                // Fetch photos and convert to base64
                const photos = []
                if (donation.photos && donation.photos.length > 0) {
                    for (const photo of donation.photos.slice(0, 4)) { // Limit to 4 photos per donation
                        try {
                            const photoUrl = pb.files.getUrl(donation, photo, { thumb: '300x300' })
                            // Fetch the photo and convert to base64
                            const response = await fetch(photoUrl)
                            const buffer = await response.arrayBuffer()
                            const base64 = Buffer.from(buffer).toString('base64')
                            const mimeType = response.headers.get('content-type') || 'image/jpeg'
                            photos.push(`data:${mimeType};base64,${base64}`)
                        } catch (e) {
                            console.error('Failed to load photo:', e)
                        }
                    }
                }

                donationsData.push({
                    id: donation.id,
                    name: donation.name,
                    date: donation.date,
                    location: donation.location || '',
                    photos,
                    items: items.map(item => ({
                        quantity: item.quantity,
                        name: item.name,
                        category: item.category,
                        quality: item.quality || '',
                        value_mode: item.value_mode,
                        unit_value: item.unit_value || 0,
                        final_value: item.final_value,
                        value_note: item.value_note || ''
                    }))
                })
            }

            if (donationsData.length > 0) {
                charitiesData.push({
                    id: charity.id,
                    name: charity.name,
                    ein: charity.ein,
                    address: charity.address,
                    description: charity.description || '',
                    donations: donationsData
                })
            }
        }

        // Generate PDF
        const pdfData = {
            year: taxYear.year,
            targetCpi: taxYear.target_cpi,
            totalValue,
            donationCount,
            itemCount: totalItemCount,
            charities: charitiesData
        }

        // Return data for client-side generation
        return NextResponse.json(pdfData)
    } catch (error) {
        console.error('PDF generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        )
    }
}
