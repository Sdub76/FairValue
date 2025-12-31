
import PocketBase from 'pocketbase'
import fs from 'fs'
import path from 'path'

// Internal URL is fine for init script running in container
const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('[Init] Starting Database Initialization...');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('[Init] PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars required');
        return;
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) {
        console.error('[Init] Authentication failed:', e.message);
        return; // Needs PB to be running!
    }

    // ALWAYS run schema setup to ensure updates are applied
    console.log('[Init] Running Schema Setup/Update...');
    await setupSchema();

    // Check if data needs seeding (empty collection?)
    try {
        const result = await pb.collection('baseline_items').getList(1, 1);
        if (result.totalItems > 0) {
            console.log('[Init] baseline_items has data. Skipping seeding.');
        } else {
            console.log('[Init] baseline_items empty. Running Seeding...');
            await seedData();
        }
    } catch (e) {
        console.error('[Init] Failed to check/seed data:', e);
    }

    console.log('[Init] Database Initialization Complete.');
}

async function setupSchema() {
    // --- SCHEMA DEFINITIONS ---

    // Helper to create or update collection and RETURN the ID
    async function createOrUpdate(data) {
        let colId = null;

        // Transform data: API uses 'fields' but our config uses 'schema'
        const apiData = { ...data, fields: data.schema };
        delete apiData.schema;

        try {
            const created = await pb.collections.create(apiData);
            console.log(`[Init] Created "${data.name}" collection (${created.id})`);
            colId = created.id;
        } catch (e) {
            // If exists, update it
            try {
                const existing = await pb.collections.getOne(data.name);
                colId = existing.id;

                await pb.collections.update(existing.id, apiData);
                console.log(`[Init] Updated/Verified "${data.name}" (${colId})`);
            } catch (err) {
                console.log(`[Init] Failed to ensure "${data.name}":`, err.message);
            }
        }
        return colId;
    }

    // 1. Charities
    const charitiesId = await createOrUpdate({
        name: 'charities',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'address', type: 'text' },
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'zip', type: 'text' },
            { name: 'ein', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });

    // 2. Tax Years
    const taxYearsId = await createOrUpdate({
        name: 'tax_years',
        type: 'base',
        schema: [
            { name: 'year', type: 'number', required: true },
            { name: 'target_cpi', type: 'number', required: true },
            { name: 'archived', type: 'bool' },
            { name: 'notes', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });

    // 3. Donations (Needs IDs from above)
    // Note: If previous run created bad schema, the 'update' in `createOrUpdate` will try to fix it 
    // because we are passing the NEW schema with correct IDs now.
    const donationsId = await createOrUpdate({
        name: 'donations',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'tax_year', type: 'relation', collectionId: taxYearsId, cascadeDelete: false, maxSelect: 1 },
            { name: 'charity', type: 'relation', collectionId: charitiesId, cascadeDelete: false, maxSelect: 1 },
            { name: 'notes', type: 'text' },
            { name: 'photos', type: 'file', maxSelect: 10, maxSize: 52428800, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif', 'application/pdf'] }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });

    // 4. Donation Items
    await createOrUpdate({
        name: 'donation_items',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'quantity', type: 'number' },
            { name: 'value', type: 'number' },
            { name: 'unit_value', type: 'number' },
            { name: 'final_value', type: 'number' },
            { name: 'value_mode', type: 'select', values: ['database', 'custom', 'cash'], maxSelect: 1 },
            { name: 'donation', type: 'relation', collectionId: donationsId, cascadeDelete: true, maxSelect: 1 },
            { name: 'category', type: 'text' },
            { name: 'quality', type: 'select', values: ['High', 'Medium'], maxSelect: 1 },
            { name: 'custom_value', type: 'number' },
            { name: 'value_note', type: 'text' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });

    // 5. Baseline Items (Training Data)
    await createOrUpdate({
        name: 'baseline_items',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'category', type: 'text' },
            { name: 'value_low_2024', type: 'number' },
            { name: 'value_high_2024', type: 'number' },
            { name: 'tags', type: 'json' }
        ],
        listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: ''
    });
}


async function seedData() {
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'docs', 'itsdeductible_fmv_guide.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('[Init] Baseline CSV not found at ' + csvPath);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    const dataRows = lines.slice(1); // Skip header
    console.log(`[Init] Seeding ${dataRows.length} items from CSV...`);



    // Parse CSV and insert
    for (const line of dataRows) {
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 4) continue;

        const [category, description, highVal, medVal] = matches.map(m => m.replace(/^"|"$/g, '').trim());

        try {
            await pb.collection('baseline_items').create({
                name: description,
                category: category,
                value_low_2024: parseFloat(medVal.replace('$', '')) || 0,
                value_high_2024: parseFloat(highVal.replace('$', '')) || 0,
                tags: []
            }, { requestKey: null });
        } catch (e) { /* ignore duplicates */ }
    }

    // --- VERIFICATION STEP ---
    console.log('[Init] Verifying Database Integrity...');
    try {
        // First, check what the actual schema looks like
        const donationsCollection = await pb.collections.getOne('donations');
        const taxYearField = donationsCollection.fields.find(f => f.name === 'tax_year');
        console.log(`[Init] Donations.tax_year field config:`, JSON.stringify(taxYearField));

        const ty = await pb.collection('tax_years').getFirstListItem('year=2025');
        console.log(`[Init] Found Tax Year 2025 (ID: ${ty.id})`);

        // Test Relation Filter
        try {
            await pb.collection('donations').getList(1, 1, { filter: `tax_year="${ty.id}"` });
            console.log('[Init] SUCCESS: "donations" relation filter works.');
        } catch (err) {
            console.error('[Init] FAIL: "donations" relation filter failed');
            console.error('[Init] Error status:', err.status);
            console.error('[Init] Error message:', err.message);
            console.error('[Init] Error data:', JSON.stringify(err.data || err.response));
            // If this fails, it often means the 'donations.tax_year' field is not a valid relation in the schema
        }
    } catch (e) {
        console.error('[Init] Verification Error:', e.message);
        if (e.data || e.response) {
            console.error('[Init] Error details:', JSON.stringify(e.data || e.response));
        }
    }
}

main();
