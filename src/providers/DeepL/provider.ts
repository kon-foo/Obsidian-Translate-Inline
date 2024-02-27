import { request } from 'obsidian';
import { Language, Translation } from 'providers/types';
import { fromLanguages, toLanguageAliases, toLanguages } from './supportedLanguages';
import { DeepLTranslation } from './types';
import { ProviderSettings, TranslationProvider } from 'providers/interface';
import { DeepLProviderSettings, deepLProviderSettingsMetadata, deepLDefaultSettings } from './settings';
import { DeepLException } from './exceptions';

export class DeepLProvider implements TranslationProvider {
	id = 'DeepL';
	settings: DeepLProviderSettings;
	settingsMetadata = deepLProviderSettingsMetadata;
	defaultSettings = deepLDefaultSettings;

	constructor(settings: ProviderSettings | undefined) {
		this.settings = (settings as DeepLProviderSettings) || this.defaultSettings;
	}

	async translate(text: string, fromLanguage: string, toLanguageOrAlias: string): Promise<Translation> {
		// Missing Deepl Features:
		// - context <-- would be super interesting to automatically add part of the note as context or be able to specify context with DeepL specific syntax.
		// - and many more...
		// Refference: https://www.deepl.com/de/docs-api/translate-text/translate-text
		try {
			const useFromLanguage = fromLanguage !== 'AUTO';
			const api = this.settings.useProApi ? 'api' : 'api-free';
			// resolve potential aliases
			const toLanguage = toLanguageAliases[toLanguageOrAlias] || toLanguageOrAlias;
			const response = await request({
				url: `https://${api}.deepl.com/v2/translate`,
				method: 'POST',
				contentType: 'application/x-www-form-urlencoded',
				body: new URLSearchParams({
					text: text,
					target_lang: toLanguage,
					...(useFromLanguage && { source_lang: fromLanguage }),
					formality: this.settings.formality
				}).toString(),
				headers: {
					Authorization: `DeepL-Auth-Key ${this.settings.apiKey}`
				},
				throw: true
			});

			const parsedResponse = JSON.parse(response);
			const translations: DeepLTranslation[] = parsedResponse.translations;
			// For now, only return the first translation
			return { success: true, result: translations[0].text };
		} catch (error) {
			let statusCode = 500;
			if (error instanceof Error) {
				statusCode = Number(error.message.match('[0-9]{3}')?.[0]) ?? statusCode;
			}
			const exception = DeepLException.createFromStatusCode(statusCode, error);
			return { success: false, errorMessage: `**${exception.message}**` };
		}
	}

	async getSupportedLanguages(): Promise<{ fromLanguages: Language[]; toLanguages: Language[] }> {
		// Iterate over fromLanguages and toLanguages to create the Language[] arrays
		const fromLangs: Language[] = [];
		const toLangs: Language[] = [];

		for (const code in fromLanguages) {
			fromLangs.push({ name: fromLanguages[code], code });
		}

		for (const code in toLanguages) {
			toLangs.push({ name: toLanguages[code], code });
		}
		for (const code in toLanguageAliases) {
			toLangs.push({ name: toLanguageAliases[code], code });
		}

		return { fromLanguages: fromLangs, toLanguages: toLangs };
	}
}
