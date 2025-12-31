import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function test() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')

        // Create a charity
        console.log('Creating charity...')
        const result = await pb.collection('charities').create({
            name: 'Test Charity',
            description: 'A test charity',
            ein: '12-3456789'
        })
        console.log('✅ Created:', result.id)

        // Read it back
        console.log('\nFetching charities...')
        const records = await pb.collection('charities').getFullList()
        console.log('✅ Found', records.length, 'charities:')
        records.forEach(r => console.log(`  - ${r.name} (${r.ein})`))

    } catch (e: any) {
        console.error('❌ Error:', e.message)
        console.error(e.response || e)
    }
}

test()
