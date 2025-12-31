#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    console.log('\n=== INSPECTING ACTUAL COLLECTION RESPONSES ===\n');

    const col = await pb.collections.getOne('tax_years');

    console.log('Full collection object keys:', Object.keys(col));
    console.log('\nCollection details:');
    console.log('- id:', col.id);
    console.log('- name:', col.name);
    console.log('- type:', col.type);
    console.log('- schema:', col.schema);
    console.log('- fields:', col.fields);
    console.log('\nRaw JSON:', JSON.stringify(col, null, 2));
}

main().catch(console.error);
