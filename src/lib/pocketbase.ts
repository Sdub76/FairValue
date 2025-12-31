
import PocketBase from 'pocketbase';

// Use internal URL for server-side (within container), public URL for client-side
const getUrl = () => typeof window === 'undefined'
    ? process.env.POCKETBASE_INTERNAL_URL || 'http://127.0.0.1:8090'
    : process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:28090';

// For client-side usage
export const pb = new PocketBase(getUrl());

// For server-side usage - creates a fresh authenticated instance every time
export async function getAdminPb() {
    if (typeof window !== 'undefined') return pb; // Client side use standard instance

    // Create a FRESH instance for this request
    const adminPb = new PocketBase(process.env.POCKETBASE_INTERNAL_URL || 'http://127.0.0.1:8090');

    const email = process.env.PB_ADMIN_EMAIL
    const password = process.env.PB_ADMIN_PASSWORD

    if (!email || !password) {
        throw new Error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set')
    }

    try {
        await adminPb.admins.authWithPassword(email, password)
        return adminPb;
    } catch (e: any) {
        console.error("❌ Server Admin Auth Failed:", e.message);
        throw e;
    }
}
