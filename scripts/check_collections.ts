import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function checkCollections() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')
        console.log('✅ Admin auth successful')

        const collections = await pb.collections.getFullList()
        console.log(`\n📊 Found ${collections.length} collections:`)
        collections.forEach(c => {
            console.log(`  - ${c.name} (id: ${c.id})`)
        })

        // Try to count records in each expected collection
        const expectedCollections = ['charities', 'tax_years', 'donations', 'donation_items', 'baseline_items']
        console.log('\n📈 Record counts:')
        for (const collName of expectedCollections) {
            try {
                const list = await pb.collection(collName).getList(1, 1)
                console.log(`  - ${collName}: ${list.totalItems} records`)
            } catch (e: any) {
                console.log(`  - ${collName}: ERROR - ${e.message}`)
            }
        }

    } catch (e: any) {
        console.error('❌ Error:', e.message)
    }
}

checkCollections()
