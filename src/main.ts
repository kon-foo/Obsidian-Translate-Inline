import { Plugin } from 'obsidian';
import { TranslateInlineSettings, defaultSettings } from './settings/pluginSettings';
import { TranslateInlineSettingsTab, StatusBarManager } from './ui';
import { TranslationProviderFactory, TranslationProvider, ProviderSettings } from './providers';
import { MatchAndTranslateExtension } from './editorextension';
import { ViewPlugin } from '@codemirror/view';
// @ts-ignore
const safeStorage = window.electron?.remote.safeStorage;

export default class TranslateInline extends Plugin {
	settings: TranslateInlineSettings;
	currentProvider: TranslationProvider;
	statusBar: StatusBarManager;

	async onload() {
		await this.loadSettings();
		this.statusBar = new StatusBarManager(this, { icon: '🌐', divider: '⇢' });
		this.statusBar.addStatusBarSection('fromLang', '', 'okay');
		this.statusBar.addStatusBarSection('toLang', '', 'okay');
		this.setCurrentProvider(this.settings.selectedProvider);
		this.addSettingTab(new TranslateInlineSettingsTab(this.app, this));

		const matchAndTranslateExtension = ViewPlugin.define(view => {
			return new MatchAndTranslateExtension(view, this);
		});
		this.registerEditorExtension(matchAndTranslateExtension);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, defaultSettings, await this.loadData());
		// Iterate over provider settings and decrypt the API keys
		console.log(safeStorage, safeStorage?.isEncryptionAvailable());
		if (this.settings.useSecureStorage) {
			for (const providerId in this.settings.providerSettings) {
				const providerSettings = this.settings.providerSettings[providerId];
				console.log('loading ... Encrypted API key', providerId, providerSettings.apiKey);
				if (providerSettings.apiKey) {
					providerSettings.apiKey =
						safeStorage?.decryptString(Buffer.from(providerSettings.apiKey, 'hex')) ||
						providerSettings.apiKey;
				}
				console.log('loading ... Decrypted API key', providerId, providerSettings.apiKey);
			}
		}
	}

	async saveSettings() {
		// Create a deep copy of the settings to avoid modifying the in-memory settings.
		const settingsToStore = JSON.parse(JSON.stringify(this.settings));
		// Iterate over provider settings and encrypt the API keys
		if (settingsToStore.useSecureStorage) {
			for (const providerId in settingsToStore.providerSettings) {
				const providerSettings = settingsToStore.providerSettings[providerId];
				console.log('saving ... Decrypted API key', providerId, providerSettings.apiKey);
				if (providerSettings.apiKey) {
					providerSettings.apiKey =
						safeStorage?.encryptString(providerSettings.apiKey).toString('hex') || providerSettings.apiKey;
				}
				console.log('savin ... Encrypted API key', providerId, providerSettings.apiKey);
			}
		}
		await this.saveData(settingsToStore);
	}

	async updateCurrentProviderSettings(updatedSettings: Partial<ProviderSettings>) {
		// Step 1: Merge the updated settings with the current provider's settings
		const newSettings: ProviderSettings = {
			...this.currentProvider.settings,
			...updatedSettings
		} as ProviderSettings;
		this.settings.providerSettings[this.currentProvider.id] = newSettings;
		await this.saveSettings();

		// Step 2: Clear the cached instance to force re-instantiation with new settings
		TranslationProviderFactory.clearProviderInstance(this.currentProvider.id);

		// Step 3: re-instantiate it
		await this.setCurrentProvider(this.currentProvider.id);
	}

	// Sets the current provider using the ProviderFactory
	async setCurrentProvider(providerId: string) {
		this.currentProvider = TranslationProviderFactory.getProviderInstance(
			providerId,
			this.settings.providerSettings[providerId]
		);
		await this.resetStatusBar();
	}

	async resetStatusBar() {
		this.statusBar.updateStatusBarSection('fromLang', {
			content: this.currentProvider.settings.fromLanguageCode,
			clsModifier: 'okay'
		});
		this.statusBar.updateStatusBarSection('toLang', {
			content: this.currentProvider.settings.toLanguageCode,
			clsModifier: 'okay'
		});
	}
}
