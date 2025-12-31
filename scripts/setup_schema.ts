
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('Setting up schema...');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars required');
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) {
        // Try creating admin if first run? 
        // Admin must be created via console or UI first usually. 
        console.error('Auth failed. Ensure Admin user exists.', e);
        return;
    }

    // Helper to create collection if not exists
    const createCollection = async (data: any) => {
        try {
            await pb.collections.getOne(data.name);
            console.log(`Collection ${data.name} already exists.`);
        } catch (e) {
            console.log(`Creating collection ${data.name}...`);
            await pb.collections.create(data);
        }
    };

    // 1. Charities
    await createCollection({
        name: 'charities',
        type: 'base',
        listRule: '', // Empty string means "anyone can list"
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'address', type: 'text' },
            { name: 'ein', type: 'text' }
        ]
    });

    // 2. Tax Years
    await createCollection({
        name: 'tax_years',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
        fields: [
            { name: 'year', type: 'number', required: true },
            { name: 'target_cpi', type: 'number' }
        ]
    });

    // 3. Donations
    await createCollection({
        name: 'donations',
        type: 'base',
        fields: [
            { name: 'date', type: 'date', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'tax_year', type: 'relation', collectionId: 'tax_years', maxSelect: 1, required: true },
            { name: 'charity', type: 'relation', collectionId: 'charities', maxSelect: 1 },
            { name: 'photos', type: 'file', maxSelect: 10, mimeTypes: ['image/*'] }
            // Note: collectionId resolution logic is simplified here. 
            // Often we need to fetch the collection ID if we reference by ID.
            // But 'collectionId' field in create payload usually takes the collection NAME or ID.
            // Wait, relation field definition 'collectionId' requires the actual ID of the target collection.
            // We need to fetch it first.
        ]
    });

    // We need IDs for relations
    const charities = await pb.collections.getOne('charities');
    const tax_years = await pb.collections.getOne('tax_years');
    // const users = await pb.collections.getOne('users'); // users is system

    // Update Donations schema with correct IDs if needed? 
    // Pb JS SDK 'create' schema syntax:
    // Actually, for relation, 'collectionId' is the ID of the target collection.
    // So for 'donations', we need to fetch 'tax_years.id' and 'charities.id'.

    // Easier way: Update the collections after creation or just fetch IDs now.

    // Since we created them, we can get them.
    // Note: The loop above might have skipped creation if exists.

    // Re-fetch to be sure
    // We already have 'charities' and 'tax_years' objects from getOne.

    // BUT, 'donations' collection creation above likely failed if I passed 'tax_years' (name) instead of ID?
    // Let's correct it.

    // Correction: delete 'donations' logic from above loop and do it here properly.

    // 3. Donations (Corrected)
    try {
        await pb.collections.getOne('donations');
        console.log('Collection donations already exists.');
    } catch {
        console.log('Creating collection donations...');
        await pb.collections.create({
            name: 'donations',
            type: 'base',
            listRule: '',
            viewRule: '',
            createRule: '',
            updateRule: '',
            deleteRule: '',
            fields: [
                { name: 'date', type: 'date', required: true },
                { name: 'name', type: 'text', required: true },
                { name: 'tax_year', type: 'relation', collectionId: tax_years.id, maxSelect: 1, required: true },
                { name: 'charity', type: 'relation', collectionId: charities.id, maxSelect: 1 },
                { name: 'photos', type: 'file', maxSelect: 10, mimeTypes: ['image/jpeg', 'image/png'] }
            ]
        });
    }

    const donations = await pb.collections.getOne('donations');

    // 4. Baseline Items
    await createCollection({
        name: 'baseline_items',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'category', type: 'text' },
            { name: 'value_low_2024', type: 'number' },
            { name: 'value_high_2024', type: 'number' },
            { name: 'tags', type: 'json' }
        ]
    });

    // 5. Donation Items
    try {
        await pb.collections.getOne('donation_items');
        console.log('Collection donation_items already exists.');
    } catch {
        console.log('Creating collection donation_items...');
        await pb.collections.create({
            name: 'donation_items',
            type: 'base',
            listRule: '',
            viewRule: '',
            createRule: '',
            updateRule: '',
            deleteRule: '',
            fields: [
                { name: 'donation', type: 'relation', collectionId: donations.id, maxSelect: 1, required: true },
                { name: 'name', type: 'text', required: true },
                { name: 'category', type: 'text' },
                { name: 'quantity', type: 'number' },
                { name: 'condition', type: 'select', options: ['Medium', 'High'] },
                { name: 'baseline_value', type: 'number' },
                { name: 'purchase_price', type: 'number' },
                { name: 'value_type', type: 'select', options: ['Database', 'Custom', 'Manual'] },
                { name: 'final_value', type: 'number' }
            ]
        });
    }

    console.log('Schema setup complete.');
}

main();
