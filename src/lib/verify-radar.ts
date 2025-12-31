import { getConfig } from './config'

export async function verifyRadarValues() {
    const config = getConfig()
    const apiKey = config.app?.RADAR_KEY

    // ANSI Color Codes
    const GREEN = '\x1b[32m'
    const RED = '\x1b[31m'
    const YELLOW = '\x1b[33m'
    const RESET = '\x1b[0m'
    const CYAN = '\x1b[36m'

    console.log(`${CYAN}[Radar Check]${RESET} Verifying API Key configuration...`)

    if (!apiKey) {
        console.warn(`${YELLOW}[Radar Check] ⚠ No API Key found in config.yaml. Autocomplete will be disabled.${RESET}`)
        return
    }

    if (apiKey === "your_key_here") {
        console.warn(`${YELLOW}[Radar Check] ⚠ Default placeholder key found. Please update config.yaml.${RESET}`)
        return
    }

    try {
        console.log(`${CYAN}[Radar Check]${RESET} Key found (${apiKey.slice(0, 8)}...). Testing connectivity...`)

        // Simple autocomplete query for "1600 Amphitheatre" to test the key
        const response = await fetch(`https://api.radar.io/v1/search/autocomplete?query=1600+Amphitheatre&limit=1`, {
            headers: {
                'Authorization': apiKey
            }
        })

        if (response.ok) {
            const data = await response.json()
            if (data.meta?.code === 200) {
                console.log(`${GREEN}[Radar Check] ✓ API Key is valid and functional!${RESET}`)
            } else {
                console.error(`${RED}[Radar Check] ⨯ API responded but returned error code: ${data.meta?.code}${RESET}`)
            }
        } else {
            console.error(`${RED}[Radar Check] ⨯ HTTP Error: ${response.status} ${response.statusText}${RESET}`)
            if (response.status === 401) {
                console.error(`${RED}[Radar Check] ⨯ Unauthorized. Please check if your API key is correct.${RESET}`)
            }
        }
    } catch (error) {
        console.error(`${RED}[Radar Check] ⨯ Connection failed: ${(error as Error).message}${RESET}`)
    }
}
