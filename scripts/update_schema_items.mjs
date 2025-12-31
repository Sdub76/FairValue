
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function main() {
    try {
        console.log('Authenticating...')
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD)

        console.log('Fetching collection...')
        const collection = await pb.collections.getOne('donation_items')

        // Ensure fields array exists
        if (!collection.fields) {
            collection.fields = []
        }

        let changed = false

        // Define fields to add
        const customValueField = {
            system: false,
            id: '',
            name: 'custom_value',
            type: 'number',
            required: false,
            presentable: false,
            unique: false,
            options: {
                min: null,
                max: null,
                noDecimal: false
            }
        }

        const valueNoteField = {
            system: false,
            id: '',
            name: 'value_note',
            type: 'text',
            required: false,
            presentable: false,
            unique: false,
            options: {
                min: null,
                max: null,
                pattern: ''
            }
        }

        // Check and add custom_value
        if (!collection.fields.find((f) => f.name === 'custom_value')) {
            console.log('Adding custom_value field...')
            collection.fields.push(customValueField)
            changed = true
        }

        // Check and add value_note
        if (!collection.fields.find((f) => f.name === 'value_note')) {
            console.log('Adding value_note field...')
            collection.fields.push(valueNoteField)
            changed = true
        }

        if (changed) {
            console.log('Updating collection...')
            // For update, we send the fields array
            await pb.collections.update(collection.id, {
                fields: collection.fields
            })
            console.log('Schema updated successfully.')
        } else {
            console.log('Schema already up to date.')
        }

    } catch (e) {
        console.error('Error:', e)
        // Log original error JSON if available
        if (e.response) {
            console.error('API Response:', JSON.stringify(e.response, null, 2))
        }
    }
}

main()
