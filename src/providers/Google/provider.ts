import { request } from 'obsidian';
import { Language, Translation } from 'providers/types';
import { TranslationProvider } from 'providers/interface';
import { GoogleProviderSettings, googleProviderSettingsMetadata, googleDefaultSettings } from './settings';
import { supportedLanguages } from './supportedLanguages';
import { GoogleTranslation } from './types';

export class GoogleProvider implements TranslationProvider {
	id = 'Google';
	settings: GoogleProviderSettings;
	settingsMetadata = googleProviderSettingsMetadata;
	defaultSettings = googleDefaultSettings;

	constructor(settings: GoogleProviderSettings | undefined) {
		this.settings = settings || this.defaultSettings;
	}

	async translate(text: string, fromLanguage: string, toLanguage: string): Promise<Translation> {
		// Missing Deepl Features:
		// - context <-- would be super interesting to automatically add part of the note as context or be able to specify context with Google specific syntax.
		// - and many more...
		// Refference: https://www.google.com/de/docs-api/translate-text/translate-text
		try {
			const useFromLanguage = fromLanguage !== 'AUTO';

			const response = await request({
				url:
					'https://translation.googleapis.com/language/translate/v2?' +
					new URLSearchParams({
						q: text,
						target: toLanguage,
						...(useFromLanguage && { source: fromLanguage }),
						format: 'text',
						model: 'nmt',
						key: this.settings.apiKey
					}).toString(),
				method: 'POST',
				contentType: 'application/json',
				throw: true
			});
			const parsedResponse = JSON.parse(response);
			const translations: GoogleTranslation[] = parsedResponse.data.translations;
			// For now, only return the first translation
			return { success: true, result: translations[0].translatedText };
		} catch (error) {
			return { success: false, errorMessage: `**${error.message}**` };
		}
	}

	async getSupportedLanguages(): Promise<{ fromLanguages: Language[]; toLanguages: Language[] }> {
		supportedLanguages.push({ code: 'AUTO', name: 'Detect Language' });
		// Transform to UpperCase
		supportedLanguages.forEach(lang => {
			lang.code = lang.code.toUpperCase();
		});
		return { fromLanguages: supportedLanguages, toLanguages: supportedLanguages };
	}
}
