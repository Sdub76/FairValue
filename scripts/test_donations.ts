import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function test() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')

        // Get donations with expanded items
        const donations = await pb.collection('donations').getFullList({
            expand: 'charity,donation_items'
        })

        console.log('Donations:', donations.length)
        if (donations.length > 0) {
            console.log('\nFirst donation:')
            console.log('- Name:', donations[0].name)
            console.log('- Expand keys:', Object.keys(donations[0].expand || {}))
            console.log('- donation_items:', donations[0].expand?.donation_items)
            console.log('\nFull donation:', JSON.stringify(donations[0], null, 2))
        }
    } catch (e: any) {
        console.error('Error:', e.message)
    }
}

test()
