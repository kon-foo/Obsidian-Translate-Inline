import { ProviderSettings, ProviderSettingMetadata } from 'providers/interface';

export interface DeepLProviderSettings extends ProviderSettings {
	formality: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
	useProApi: boolean;
}

export const deepLProviderSettingsMetadata: { [key: string]: ProviderSettingMetadata } = {
	formality: {
		type: 'dropdown',
		name: 'Formality',
		description: 'The formality of the translation',
		options: [
			{ label: 'Default', value: 'default' },
			{ label: 'More Formal', value: 'more' },
			{ label: 'Less Formal', value: 'less' },
			{ label: 'Prefer More Formal', value: 'prefer_more' },
			{ label: 'Prefer Less Formal', value: 'prefer_less' }
		]
	},
	useProApi: {
		type: 'toggle',
		name: 'Use DeepL Pro API',
		description: 'Use the DeepL Pro API for translations'
	}
};

export const deepLDefaultSettings: DeepLProviderSettings = {
	apiKey: '',
	fromLanguageCode: 'AUTO',
	toLanguageCode: 'EN-GB',
	formality: 'default',
	useProApi: false
};
