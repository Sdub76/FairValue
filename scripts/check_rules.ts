import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function checkRules() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890')

        const collections = ['charities', 'tax_years', 'baseline_items']

        for (const name of collections) {
            const coll = await pb.collections.getOne(name)
            console.log(`\n📋 ${name}:`)
            console.log('  listRule:', coll.listRule === null ? 'null (locked)' : coll.listRule === '' ? '""(public)' : coll.listRule)
            console.log('  viewRule:', coll.viewRule === null ? 'null (locked)' : coll.viewRule === '' ? '""(public)' : coll.viewRule)
            console.log('  createRule:', coll.createRule === null ? 'null (locked)' : coll.createRule === '' ? '"" (public)' : coll.createRule)
        }
    } catch (e: any) {
        console.error('Error:', e.message)
    }
}

checkRules()
