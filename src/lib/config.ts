
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface AppConfig {
    app: {
        password?: string
    }
}

export function getConfigPath(): string {
    // 1. Env variable override
    if (process.env.CONFIG_FILE_PATH) {
        return process.env.CONFIG_FILE_PATH
    }

    // 2. Container Standard Path (mapped volume)
    const containerPath = '/config/config.yaml'
    if (fs.existsSync(containerPath)) {
        return containerPath
    }

    // 3. Fallback to project dir (development)
    return path.join(process.cwd(), 'config', 'config.yaml')
}

export function getConfig(): AppConfig {
    const configPath = getConfigPath()
    try {
        if (!fs.existsSync(configPath)) {
            console.warn(`Config file not found at ${configPath}`)
            return { app: { password: 'changeme' } }
        }
        const fileContents = fs.readFileSync(configPath, 'utf8')
        return yaml.load(fileContents) as AppConfig
    } catch (e) {
        console.error(`Failed to read config.yaml at ${configPath}`, e)
        return { app: { password: 'changeme' } }
    }
}

export function updateConfig(newConfig: AppConfig) {
    const configPath = getConfigPath()
    try {
        const yamlStr = yaml.dump(newConfig)
        fs.writeFileSync(configPath, yamlStr, 'utf8')
    } catch (e) {
        console.error(`Failed to write config.yaml at ${configPath}`, e)
        throw e
    }
}
