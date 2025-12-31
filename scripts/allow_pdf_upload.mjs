
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('[Schema Update] Starting...');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('[Schema Update] PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars required');
        process.exit(1);
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log('[Schema Update] Authenticated.');
    } catch (e) {
        console.error('[Schema Update] Authentication failed:', e.message);
        process.exit(1);
    }

    try {
        const collection = await pb.collections.getOne('donations');
        console.log('[Schema Update] Found "donations" collection.');
        console.log('[Schema Update] Collection keys:', Object.keys(collection));
        // console.log('[Schema Update] Collection schema:', JSON.stringify(collection.schema, null, 2));

        // PocketBase v0.23+ uses 'fields' array
        const fields = collection.fields || [];
        console.log('[Schema Update] Fields found:', fields.length);

        const photosField = fields.find(f => f.name === 'photos');

        if (photosField) {
            console.log('[Schema Update] Found "photos" field:', JSON.stringify(photosField, null, 2));
            if (!photosField.options) photosField.options = {};

            // Expected valid mime types for images + PDF
            const requiredMimeTypes = [
                "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/heic", "image/heif",
                "application/pdf"
            ];

            // Force set
            photosField.options.mimeTypes = requiredMimeTypes;

            console.log('[Schema Update] Setting mimeTypes to:', requiredMimeTypes);

            // Update collection with new fields
            try {
                await pb.collections.update('donations', { fields: fields });
                console.log('[Schema Update] Successfully updated collection fields.');
            } catch (err) {
                console.error('[Schema Update] Update failed:', err.data || err);
            }
        } else {
            console.log('[Schema Update] "photos" field not found in fields!');
        }

    } catch (e) {
        console.error('[Schema Update] Failure:', e);
    }
}

main();
