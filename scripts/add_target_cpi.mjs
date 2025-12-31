#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    const col = await pb.collections.getOne('tax_years');

    await pb.collections.update(col.id, {
        fields: [
            { name: 'year', type: 'number', required: true },
            { name: 'target_cpi', type: 'number', required: true },
            { name: 'archived', type: 'bool' },
            { name: 'notes', type: 'text' }
        ]
    });

    console.log('✅ Added target_cpi field to tax_years schema');
}

main().catch(console.error);
