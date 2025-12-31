
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function main() {
    try {
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD)
        const collection = await pb.collections.getOne('donations')
        console.log(JSON.stringify(collection, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
}

main()
