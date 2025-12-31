import PocketBase from 'pocketbase'

async function testCharities() {
    const pb = new PocketBase('http://127.0.0.1:8090')

    try {
        console.log('1. Authenticating...')
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')
        console.log('✅ Auth successful')

        console.log('\n2. Fetching charities WITHOUT sort...')
        const records1 = await pb.collection('charities').getFullList()
        console.log('✅ SUCCESS! Found', records1.length, 'charities')
        console.log('Records:', JSON.stringify(records1, null, 2))

        console.log('\n3. Fetching charities WITH sort...')
        const records2 = await pb.collection('charities').getFullList({ sort: 'name' })
        console.log('✅ SUCCESS! Found', records2.length, 'charities with sort')

    } catch (e: any) {
        console.error('\n❌ ERROR:', e.message)
        console.error('Status:', e.status)
        console.error('Response:', JSON.stringify(e.response, null, 2))
    }
}

testCharities()
