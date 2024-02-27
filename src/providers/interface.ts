import { Language, Translation } from './types';

export interface TranslationProvider {
	id: string;
	settings: ProviderSettings;
	defaultSettings: ProviderSettings;
	settingsMetadata: { [key: string]: ProviderSettingMetadata };
	getSupportedLanguages(): Promise<{ fromLanguages: Language[]; toLanguages: Language[] }>;
	translate(text: string, fromLanguage: string, toLanguage: string): Promise<Translation>;
}

export interface ProviderSettings {
	// shared across all providers
	// when extended, the defaultSettings and settingsMetadata should be updated in the provider
	apiKey: string;
	fromLanguageCode: string;
	toLanguageCode: string;
	[key: string]: string | boolean;
}

export interface ProviderSettingMetadata {
	type: 'text' | 'dropdown' | 'toggle';
	name: string;
	description: string;
	options?: { label: string; value: string }[]; // Only used for dropdowns
}
