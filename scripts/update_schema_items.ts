import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

async function main() {
    try {
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL!, process.env.PB_ADMIN_PASSWORD!)

        const collection = await pb.collections.getOne('donation_items')

        let changed = false

        if (!collection.schema.find((f: any) => f.name === 'custom_value')) {
            console.log('Adding custom_value field...')
            collection.schema.push({
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
            })
            changed = true
        }

        if (!collection.schema.find((f: any) => f.name === 'value_note')) {
            console.log('Adding value_note field...')
            collection.schema.push({
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
            })
            changed = true
        }

        if (changed) {
            await pb.collections.update(collection.id, collection)
            console.log('Schema updated successfully.')
        } else {
            console.log('Schema already up to date.')
        }

    } catch (e) {
        console.error('Error:', e)
    }
}

main()
