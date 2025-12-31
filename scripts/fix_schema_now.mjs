#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('Authenticating...');
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    console.log('\n=== CREATING COLLECTIONS WITH PROPER SCHEMA ===\n');

    // Delete old broken collections
    for (const name of ['donation_items', 'donations', 'charities', 'tax_years']) {
        try {
            await pb.collections.delete(name);
            console.log(`Deleted ${name}`);
        } catch (e) { }
    }

    // Create charities
    const charities = await pb.collections.create({
        name: 'charities',
        type: 'base',
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'address', type: 'text' },
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'zip', type: 'text' },
            { name: 'ein', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });
    console.log(`✅ Created charities (${charities.id})`);

    // Create tax_years  
    const taxYears = await pb.collections.create({
        name: 'tax_years',
        type: 'base',
        fields: [
            { name: 'year', type: 'number', required: true },
            { name: 'archived', type: 'bool' },
            { name: 'notes', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });
    console.log(`✅ Created tax_years (${taxYears.id})`);

    // Create donations with CORRECT relation format (collectionId at top level, not in options)
    const donations = await pb.collections.create({
        name: 'donations',
        type: 'base',
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'tax_year', type: 'relation', collectionId: taxYears.id, cascadeDelete: false, maxSelect: 1 },
            { name: 'charity', type: 'relation', collectionId: charities.id, cascadeDelete: false, maxSelect: 1 },
            { name: 'notes', type: 'text' },
            { name: 'photos', type: 'file', maxSelect: 10, maxSize: 52428800, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif'] }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });
    console.log(`✅ Created donations (${donations.id})`);

    // Create donation_items
    const donationItems = await pb.collections.create({
        name: 'donation_items',
        type: 'base',
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'quantity', type: 'number' },
            { name: 'value', type: 'number' },
            { name: 'unit_value', type: 'number' },
            { name: 'value_mode', type: 'select', values: ['database', 'custom'], maxSelect: 1 },
            { name: 'donation', type: 'relation', collectionId: donations.id, cascadeDelete: true, maxSelect: 1 },
            { name: 'category', type: 'text' },
            { name: 'quality', type: 'select', values: ['Excellent', 'Good', 'Fair', 'Poor'], maxSelect: 1 },
            { name: 'custom_value', type: 'number' },
            { name: 'value_note', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });
    console.log(`✅ Created donation_items (${donationItems.id})`);

    // Test!
    console.log('\n=== TESTING ===\n');
    const testYear = await pb.collection('tax_years').create({ year: 2025, notes: 'Test' });
    console.log(`Created test year: ${testYear.id}`);

    try {
        await pb.collection('donations').getList(1, 1, { filter: `tax_year="${testYear.id}"` });
        console.log('✅✅✅ SUCCESS! Filter works!');
    } catch (e) {
        console.log('❌ Filter still fails:', e.message);
        console.log('Error data:', e.data);
    }
}

main().catch(console.error);
