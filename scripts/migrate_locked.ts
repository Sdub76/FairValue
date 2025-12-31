
import PocketBase from 'pocketbase';

async function migrate() {
    // Connect to PocketBase - use 127.0.0.1 for local connection inside container
    const pb = new PocketBase('http://127.0.0.1:8090');

    // Authenticate as Admin (using env vars or default dev creds)
    const email = process.env.PB_ADMIN_EMAIL || 'admin@fairvalue.app';
    const password = process.env.PB_ADMIN_PASSWORD || '1234567890';

    try {
        await pb.admins.authWithPassword(email, password);
        console.log('Authenticated as admin');

        // Get the collection
        const collection = await pb.collections.getOne('tax_years');
        console.log('Found collection tax_years', JSON.stringify(collection, null, 2));

        // Use 'fields' based on the log output
        const currentFields = collection.fields || [];
        const fieldExists = currentFields.some((f: any) => f.name === 'locked');

        if (fieldExists) {
            console.log('Field "locked" already exists.');
            return;
        }

        // Add the field
        const newFields = [
            ...currentFields,
            {
                "system": false,
                "id": "locked_bool",
                "name": "locked",
                "type": "bool",
                "required": false,
                "presentable": false,
                "unique": false,
                "options": {}
            }
        ];

        // Update the collection
        await pb.collections.update('tax_years', { fields: newFields });
        console.log('Successfully added "locked" field to tax_years collection.');

    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
