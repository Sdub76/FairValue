#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');

    const col = await pb.collections.getOne('donations');

    console.log('\n=== DONATIONS COLLECTION ===\n');
    console.log('Fields:');
    col.fields.forEach(f => {
        if (f.type === 'relation') {
            console.log(`  - ${f.name} (${f.type}) -> collectionId: "${f.collectionId}"`);
        } else {
            console.log(`  - ${f.name} (${f.type})`);
        }
    });

    // Test the filter one more time
    console.log('\n=== FINAL FILTER TEST ===\n');
    const taxYears = await pb.collection('tax_years').getFullList();
    console.log(`Found ${taxYears.length} tax year(s)`);

    if (taxYears.length > 0) {
        try {
            const result = await pb.collection('donations').getList(1, 1, {
                filter: `tax_year="${taxYears[0].id}"`
            });
            console.log(`✅✅✅ SUCCESS! Filter query works perfectly!`);
            console.log(`Found ${result.totalItems} donation(s)`);
        } catch (e) {
            console.log(`❌ Filter failed:`, e.message);
        }
    }
}

main().catch(console.error);
