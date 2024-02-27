import { ProviderSettings, ProviderSettingMetadata } from 'providers/interface';

export interface GoogleProviderSettings extends ProviderSettings {}

export const googleProviderSettingsMetadata: { [key: string]: ProviderSettingMetadata } = {};

export const googleDefaultSettings: GoogleProviderSettings = {
	apiKey: '',
	fromLanguageCode: 'AUTO',
	toLanguageCode: 'EN'
};
