
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log('[Verify Schema] Starting...');
    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    try {
        await pb.admins.authWithPassword(email, password);
        const collection = await pb.collections.getOne('donations');
        const fields = collection.fields || [];
        const photosField = fields.find(f => f.name === 'photos');

        console.log('[Verify Schema] Allowed MimeTypes:', JSON.stringify(photosField?.options?.mimeTypes || [], null, 2));

        if (photosField.options.mimeTypes.includes('application/pdf')) {
            console.log('[Verify Schema] SUCCESS: application/pdf is allowed.');
        } else {
            console.log('[Verify Schema] FAIL: application/pdf is NOT allowed.');
        }

    } catch (e) {
        console.error('[Verify Schema] Error:', e);
    }
}

main();
