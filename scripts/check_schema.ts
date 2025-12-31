import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function checkSchema() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')

        const coll = await pb.collections.getOne('charities')
        console.log('Charities collection schema:')
        console.log('Fields:', JSON.stringify(coll.fields || coll.schema, null, 2))
        console.log('Raw collection:', JSON.stringify(coll, null, 2))

        // Try to get one record and see what's in it
        const records = await pb.collection('charities').getFullList()
        console.log('\nFound', records.length, 'records')
        if (records.length > 0) {
            console.log('First record:', JSON.stringify(records[0], null, 2))
        }
    } catch (e: any) {
        console.error('Error:', e.message)
    }
}

checkSchema()
