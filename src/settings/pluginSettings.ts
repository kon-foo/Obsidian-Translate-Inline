import { ProviderSettings } from 'providers';

// @ts-ignore
const safeStorage = window.electron?.remote.safeStorage;

export interface TranslateInlineSettings {
	selectedProvider: string;
	providerSettings: {
		[providerName: string]: ProviderSettings;
	};
	useSecureStorage?: boolean;
	// bracketSearchDepth?: number;
	// enclosingSymbols: '[]' | '()' | "{}" | '**' | '""' | "''";
	// dividerSymbol: '>' | '|'
}

export const defaultSettings: TranslateInlineSettings = {
	selectedProvider: 'DeepL',
	providerSettings: {}, //falls back to the default settings defined in the provider
	useSecureStorage: safeStorage && safeStorage.isEncryptionAvailable ? true : false
};
