import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('Setting up schema (FIXED VERSION)...');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars required');
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log('✅ Authenticated');
    } catch (e) {
        console.error('Auth failed. Ensure Admin user exists.', e);
        return;
    }

    const createOrUpdate = async (data: any) => {
        try {
            const existing = await pb.collections.getOne(data.name);
            console.log(`Collection ${data.name} exists, skipping`);
        } catch {
            console.log(`Creating ${data.name}...`);
            await pb.collections.create(data);
        }
    };

    // Create base collections WITHOUT relations
    await createOrUpdate({
        name: 'charities',
        type: 'base',
        listRule: '',
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

    await createOrUpdate({
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

    await createOrUpdate({
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

    // Get IDs for relations
    const charitiesCol = await pb.collections.getOne('charities');
    const taxYearsCol = await pb.collections.getOne('tax_years');

    await createOrUpdate({
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
            { name: 'tax_year', type: 'relation', collectionId: taxYearsCol.id, maxSelect: 1, required: true },
            { name: 'charity', type: 'relation', collectionId: charitiesCol.id, maxSelect: 1 },
            { name: 'photos', type: 'file', maxSelect: 10, mimeTypes: ['image/jpeg', 'image/png'] }
        ]
    });

    const donationsCol = await pb.collections.getOne('donations');

    await createOrUpdate({
        name: 'donation_items',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
        fields: [
            { name: 'donation', type: 'relation', collectionId: donationsCol.id, maxSelect: 1, required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'category', type: 'text' },
            { name: 'quantity', type: 'number' },
            { name: 'condition', type: 'select', values: ['Medium', 'High'] },
            { name: 'baseline_value', type: 'number' },
            { name: 'purchase_price', type: 'number' },
            { name: 'value_type', type: 'select', values: ['Database', 'Custom', 'Manual'] },
            { name: 'final_value', type: 'number' }
        ]
    });

    console.log('✅ Schema setup complete.');
}

main();
