#!/usr/bin/env node
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('admin@fairvalue.app', '1234567890');
    } catch (e) {
        console.error('Failed to authenticate:', e.message);
        return;
    }

    console.log('\n=== SCHEMA DIAGNOSIS ===\n');

    const collections = ['tax_years', 'charities', 'donations', 'donation_items'];

    for (const name of collections) {
        try {
            const col = await pb.collections.getOne(name);
            console.log(`\n📦 Collection: ${name}`);
            console.log(`   ID: ${col.id}`);
            console.log(`   Rules: list="${col.listRule || ''}", view="${col.viewRule || ''}"`);
            console.log(`   Schema fields (${col.schema?.length || 0}):`);

            if (col.schema && col.schema.length > 0) {
                col.schema.forEach(f => {
                    if (f.type === 'relation') {
                        const collId = f.options?.collectionId || 'MISSING/ERROR';
                        console.log(`     - ${f.name} (relation) -> collectionId: "${collId}"`);
                    } else {
                        console.log(`     - ${f.name} (${f.type})`);
                    }
                });
            } else {
                console.log('     (no schema fields found)');
            }
        } catch (e) {
            console.log(`\n❌ Collection: ${name} - ERROR: ${e.message}`);
        }
    }

    // Test the actual filter
    console.log('\n=== TESTING DATA & FILTER ===\n');
    try {
        const taxYears = await pb.collection('tax_years').getFullList();
        console.log(`Found ${taxYears.length} tax year(s)`);

        if (taxYears.length === 0) {
            console.log('\n⚠️  No tax years exist. Creating test year...');
            const testYear = await pb.collection('tax_years').create({ year: 2025, notes: 'Test' });
            console.log(`Created test year: ${testYear.id}`);

            console.log('\nTesting filter with new tax year...');
            try {
                const result = await pb.collection('donations').getList(1, 1, {
                    filter: `tax_year="${testYear.id}"`
                });
                console.log(`✅ Filter works! Found ${result.totalItems} donation(s)`);
            } catch (err) {
                console.log(`❌ Filter FAILED!`);
                console.log(`   Status: ${err.status}`);
                console.log(`   Message: ${err.message}`);
                if (err.data) console.log(`   Data:`, JSON.stringify(err.data, null, 2));
            }
        }
    } catch (e) {
        console.log('Error testing filter:', e.message);
    }
}

main().catch(console.error);
