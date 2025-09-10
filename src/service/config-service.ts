export class ConfigService {
    static async loadConfig<T>(path: string, defaults: T): Promise<T> {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load config: ${path}`);
            const config = await response.json();
            return { ...defaults, ...config };
        } catch (error) {
            console.warn(`Using default config for ${path}:`, error);
            return defaults;
        }
    }
}
