
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function main() {
    try {
        console.log('Authenticating...')
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD)

        console.log('Fetching collection...')
        const collection = await pb.collections.getOne('donations')

        // Ensure fields array exists
        if (!collection.fields) {
            console.error('No fields found in collection')
            return
        }

        const photoField = collection.fields.find((f) => f.name === 'photos')

        if (photoField) {
            console.log(`Current maxSize: ${photoField.maxSize}`)
            // Set to 20MB (20 * 1024 * 1024)
            const newLimit = 20 * 1024 * 1024
            if (photoField.maxSize !== newLimit) {
                console.log(`Updating maxSize to use ${newLimit} bytes...`)
                photoField.maxSize = newLimit

                await pb.collections.update(collection.id, {
                    fields: collection.fields
                })
                console.log('Schema updated successfully.')
            } else {
                console.log('Schema already has the correct limit.')
            }
        } else {
            console.error('Photos field not found!')
        }

    } catch (e) {
        console.error('Error:', e)
        if (e.response) {
            console.error('API Response:', JSON.stringify(e.response, null, 2))
        }
    }
}

main()
