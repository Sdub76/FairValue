#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    console.log('Updating charities schema...');
    const charities = await pb.collections.getOne('charities');
    await pb.collections.update(charities.id, {
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'address', type: 'text' },
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'zip', type: 'text' },
            { name: 'ein', type: 'text' }
        ]
    });
    console.log('✅ Added description field to charities');

    console.log('\nUpdating donation_items schema...');
    const donationItems = await pb.collections.getOne('donation_items');
    await pb.collections.update(donationItems.id, {
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'quantity', type: 'number' },
            { name: 'value', type: 'number' },
            { name: 'unit_value', type: 'number' },
            { name: 'final_value', type: 'number' },
            { name: 'value_mode', type: 'select', values: ['database', 'custom'], maxSelect: 1 },
            { name: 'donation', type: 'relation', collectionId: donationItems.fields.find(f => f.name === 'donation').collectionId, cascadeDelete: true, maxSelect: 1 },
            { name: 'category', type: 'text' },
            { name: 'quality', type: 'select', values: ['Excellent', 'Good', 'Fair', 'Poor'], maxSelect: 1 },
            { name: 'custom_value', type: 'number' },
            { name: 'value_note', type: 'text' }
        ]
    });
    console.log('✅ Added final_value field to donation_items');
}

main().catch(console.error);
