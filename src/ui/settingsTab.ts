import { PluginSettingTab, Setting, App, Notice } from 'obsidian';

import TranslateInline from 'main';
import { availableProviders } from '../providers';

// @ts-ignore
const safeStorage = window.electron?.remote.safeStorage;

export default class TranslateInlineSettingsTab extends PluginSettingTab {
	plugin: TranslateInline;

	constructor(app: App, plugin: TranslateInline) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h3', { text: 'Translate Inline Settings' });

		// Provider selection dropdown
		new Setting(containerEl)
			.setName('Translation Provider')
			.setDesc('Select your translation provider')
			.addDropdown(drop => {
				availableProviders.forEach(provider => {
					drop.addOption(provider, provider);
				});
				drop.setValue(this.plugin.settings.selectedProvider).onChange(async (value: string) => {
					this.plugin.settings.selectedProvider = value;
					await this.plugin.saveSettings();
					this.plugin.setCurrentProvider(value);
					this.display(); // Refresh the settings tab to update the languages dropdown based on the selected provider
				});
			});

		// Provider settings
		containerEl.createEl('div', { cls: 'mt-8' });
		containerEl.createEl('h5', { text: `${this.plugin.settings.selectedProvider} Settings` });

		// API Key
		new Setting(containerEl)
			.setName('API Key')
			.setDesc(`${this.plugin.settings.selectedProvider} API Key`)
			.addText(text =>
				text
					.setPlaceholder('Enter your API Key')
					.setValue(this.plugin.currentProvider.settings.apiKey)
					.onChange(async value => {
						this.plugin.updateCurrentProviderSettings({ apiKey: value });
					})
			);

		this.plugin.currentProvider.getSupportedLanguages().then(({ fromLanguages, toLanguages }) => {
			// Example of populating 'from' language dropdown
			// Repeat similarly for 'to' language dropdown
			new Setting(containerEl)
				.setName('Default From Language')
				.setDesc('Select a default source language')
				.addDropdown(drop => {
					fromLanguages.forEach(lang => {
						drop.addOption(lang.code, lang.name);
					});
					drop.setValue(this.plugin.currentProvider.settings.fromLanguageCode);
					drop.onChange(async (value: string) => {
						this.plugin.updateCurrentProviderSettings({ fromLanguageCode: value });
					});
				});

			new Setting(containerEl)
				.setName('Default To Language')
				.setDesc('Select a default target language')
				.addDropdown(drop => {
					toLanguages.forEach(lang => {
						drop.addOption(lang.code, lang.name);
					});
					drop.setValue(this.plugin.currentProvider.settings.toLanguageCode);
					drop.onChange(async (value: string) => {
						this.plugin.updateCurrentProviderSettings({ toLanguageCode: value });
					});
				});

			containerEl.createEl('div', { cls: 'mt-4' });

			if (Object.entries(this.plugin.currentProvider.settingsMetadata).length > 0) {
				containerEl.createEl('h6', { text: `${this.plugin.settings.selectedProvider} Exclusive Settings` });
			}
			// Iterate over the settings of the selected provider and create a setting for each
			Object.entries(this.plugin.currentProvider.settingsMetadata || {}).forEach(([key, settingMetadata]) => {
				const setting = new Setting(containerEl)
					.setName(settingMetadata.name)
					.setDesc(settingMetadata.description);

				if (settingMetadata.type === 'dropdown' && settingMetadata.options) {
					// Create a dropdown for settings that require it
					setting.addDropdown(dropdown => {
						settingMetadata.options!.forEach(option => {
							dropdown.addOption(option.value, option.label);
						});
						dropdown
							.setValue(
								String(
									this.plugin.currentProvider.settings[key] ||
										this.plugin.currentProvider.defaultSettings[key]
								)
							)
							.onChange(async value => {
								await this.plugin.updateCurrentProviderSettings({ [key]: value });
							});
					});
				} else if (settingMetadata.type === 'text') {
					// Assume text input for other settings, or implement other types as needed
					setting.addText(text =>
						text
							.setValue(
								String(
									this.plugin.currentProvider.settings[key] ||
										this.plugin.currentProvider.defaultSettings[key]
								)
							)
							.onChange(async value => {
								await this.plugin.updateCurrentProviderSettings({ [key]: value });
							})
					);
				} else if (settingMetadata.type === 'toggle') {
					// Assume toggle input for other settings, or implement other types as needed
					setting.addToggle(toggle =>
						toggle
							.setValue(
								Boolean(
									this.plugin.currentProvider.settings[key] ||
										this.plugin.currentProvider.defaultSettings[key]
								)
							)
							.onChange(async value => {
								await this.plugin.updateCurrentProviderSettings({ [key]: value });
							})
					);
				} else {
					console.error(`Unknown setting type: ${settingMetadata.type}`);
				}
			});

			// Advanced settings
			containerEl.createEl('div', { cls: 'mt-8' });
			containerEl.createEl('h5', { text: 'Advanced Settings' });
			new Setting(containerEl)
				.setName('Use Secure Storage')
				.setDesc('Encrypt API keys using Electron secureStorage if available.')
				.addToggle(toggle =>
					toggle.setValue(Boolean(this.plugin.settings.useSecureStorage)).onChange(async value => {
						new Notice('Currently not supported.');
						toggle.setValue(false);
						// if (value === true && !(safeStorage && safeStorage.isEncryptionAvailable)) {
						// 	new Notice('Cannot enable secureStorage. Only available on Obsidian Desktop.');
						// 	toggle.setValue(false);
						// 	return;
						// }
						this.plugin.settings.useSecureStorage = value;
						await this.plugin.saveSettings();
					})
				);
		});
	}
}
