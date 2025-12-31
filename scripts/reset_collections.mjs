#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    console.log('DELETING broken collections...');

    try {
        await pb.collections.delete('donation_items');
        console.log('✅ Deleted donation_items');
    } catch (e) { console.log('❌ donation_items:', e.message); }

    try {
        await pb.collections.delete('donations');
        console.log('✅ Deleted donations');
    } catch (e) { console.log('❌ donations:', e.message); }

    try {
        await pb.collections.delete('charities');
        console.log('✅ Deleted charities');
    } catch (e) { console.log('❌ charities:', e.message); }

    try {
        await pb.collections.delete('tax_years');
        console.log('✅ Deleted tax_years');
    } catch (e) { console.log('❌ tax_years:', e.message); }

    console.log('\nNow run: docker exec fairvalue-dev node scripts/init_db.mjs');
}

main().catch(console.error);
