export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { verifyRadarValues } = await import('./lib/verify-radar')
        await verifyRadarValues()
    }
}
