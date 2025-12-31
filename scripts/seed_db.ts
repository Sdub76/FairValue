
import PocketBase from 'pocketbase';
import items from '../docs/valuation_baseline.json';

const pb = new PocketBase('http://127.0.0.1:8090'); // Internal docker network URL

async function main() {
    console.log('Start seeding...');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars required');
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) {
        console.error('Authentication failed:', e);
        return;
    }

    // Define connection to check if 'baseline_items' exists
    try {
        await pb.collections.getOne('baseline_items');
        console.log('baseline_items collection exists.');
    } catch (e) {
        console.error('baseline_items collection missing. Please run setup_schema.ts first.');
        return;
    }

    // Seed items
    console.log(`Seeding ${items.length} items...`);
    const batchSize = 50;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(item => {
            return pb.collection('baseline_items').create({
                name: item.item_name,
                category: item.category,
                value_low_2024: item.value_low,
                value_high_2024: item.value_high,
                tags: item.tags
            }).catch(err => console.error(`Failed to seed item: ${item.item_name}`, err));
        }));
        console.log(`Seeded ${Math.min(i + batchSize, items.length)} / ${items.length}`);
    }

    console.log('Seeding complete.');
}

main();
