import { ProviderSettingMetadata, ProviderSettings, TranslationProvider } from 'providers/interface';
import { Language, Translation } from 'providers/types';

// Dummy TranslationProvider that reverses the input text
export class ReverseProvider implements TranslationProvider {
	id = 'Reverse';
	settings: ProviderSettings;
	settingsMetadata: { [key: string]: ProviderSettingMetadata } = {};
	defaultSettings: ProviderSettings = {
		apiKey: '',
		fromLanguageCode: 'ER',
		toLanguageCode: 'RE'
	};

	constructor(settings: ProviderSettings | undefined) {
		this.settings = settings || this.defaultSettings;
	}

	async translate(text: string): Promise<Translation> {
		return { success: true, result: text.split('').reverse().join('') };
	}

	async getSupportedLanguages(): Promise<{ fromLanguages: Language[]; toLanguages: Language[] }> {
		return {
			fromLanguages: [{ name: 'Any', code: 'ER' }],
			toLanguages: [{ name: 'Any-Revers', code: 'RE' }]
		};
	}
}
