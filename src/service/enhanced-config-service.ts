export class EnhancedConfigService {
    private static configCache = new Map<string, any>();

    static async loadConfig<T>(path: string, defaults: T): Promise<T> {
        if (this.configCache.has(path)) {
            return this.configCache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load config: ${path}`);
            const config = await response.json();
            const mergedConfig = { ...defaults, ...config };

            this.configCache.set(path, mergedConfig);

            return mergedConfig;
        } catch (error) {
            console.warn(`Using default config for ${path}:`, error);
            return defaults;
        }
    }

    static clearCache(): void {
        this.configCache.clear();
    }
}
