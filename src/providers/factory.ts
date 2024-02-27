import { DeepLProvider } from './DeepL/provider';
import { ReverseProvider } from './Reverse/provider';
import { GoogleProvider } from './Google/provider';
import { ProviderSettings, TranslationProvider } from './interface';

export class TranslationProviderFactory {
	// Cache of provider instances
	private static instanceCache: { [providerName: string]: TranslationProvider } = {};

	// Method to get a provider instance by id
	static getProviderInstance(providerName: string, settings: ProviderSettings | undefined): TranslationProvider {
		if (!this.instanceCache[providerName]) {
			switch (providerName) {
				case 'DeepL':
					this.instanceCache[providerName] = new DeepLProvider(settings);
					break;
				case 'Google':
					this.instanceCache[providerName] = new GoogleProvider(settings);
					break;
				case 'Reverse':
					this.instanceCache[providerName] = new ReverseProvider(settings);
					break;
				default:
					throw new Error(`Unsupported provider: ${providerName}`);
			}
		}
		return this.instanceCache[providerName];
	}

	// Method to clear or update a specific provider instance if settings change
	static clearProviderInstance(providerName: string): void {
		delete this.instanceCache[providerName];
	}
}
