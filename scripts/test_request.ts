import PocketBase from 'pocketbase'

async function testRequest() {
    const pb = new PocketBase('http://127.0.0.1:8090')

    try {
        console.log('1. Authenticating...')
        const authData = await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')
        console.log('✅ Auth successful, token:', authData.token.substring(0, 20) + '...')
        console.log('✅ AuthStore valid:', pb.authStore.isValid)
        console.log('✅ AuthStore model:', pb.authStore.model?.email || 'N/A')

        console.log('\n2. Fetching tax_years...')
        const records = await pb.collection('tax_years').getFullList()
        console.log('✅ SUCCESS! Found', records.length, 'tax years')
        console.log('Records:', JSON.stringify(records, null, 2))

    } catch (e: any) {
        console.error('\n❌ ERROR:', e.message)
        console.error('Status:', e.status)
        console.error('Response:', JSON.stringify(e.response, null, 2))
        console.error('Data:', e.data)
        console.error('Original error:', e.originalError)
    }
}

testRequest()
