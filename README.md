## Obsidian Translate Inline
Created with the help of the [Obsidian Plugin Template](https://github.com/kon-foo/ObsidianPluginTemplate). This plugin is in **open beta** and is not yet available in the community plugins list. It works-for-me™ but hasn't been tested extensively. Please report any issues you encounter.
You can download the latest release from the [releases page]().

With this plugin you can get translations without moving away from your keybord. For example translate from an auto-detected language to your default language by typing:
```markdown
[>Buenos días] # Translate using your default settings
```
As soon as the cursor leaves the square brackets, this will be replaced with:
```markdown
Good morning
```

You may also specify the target language inline to use a different language than the default:
```markdown
[>de>Buenos días] # Translate from default to German
```
This will translate the text to German:
```markdown
Guten Morgen
```
Of course, you can also specify the source language:
```markdown
[es>de>Buenos días] # Translate from Spanish to German
[es>Buenos días] # Translate from Spanish to your default language
```

### Translation Providers.
To use this plugin, you need to have an API key from a supported translation provider. Currently, the plugin supports:
- [DeepL](https://www.deepl.com/)
- [Google Cloud Translation](https://cloud.google.com/translate)
Both of these providers offer a free tier. While Google supports much more languages, DeepL is much easier to set up if you are not already familiar with Google Cloud.

### Privacy
It should be self evident that the text you translate is sent to the translation provider, so their privacy policy applies. The plugin itself does not collect any data. The API key is stored in the Obsidian vault in plain text (for now), so you should keep your vault secure.

### To-Do:
#### Pre-Release:
- [x] Add Electron Secure Storage for API keys (only on Desktop)
- [x] Nicer Status Bar UI

#### Later:
- [ ] Add support for more translation providers
- [ ] Allow to pass translation provide specific options in-line , e.g. [>some text|formal] could set the formaliy option when using DeepL.
- [ ] Option to change syntax aka. the divider and enclose characters.
- [ ] Trigger translation by hitting `enter` or `tab` within the square bracket.

## Support Me!
If you find like this Plugin, I would be grateful if you would buy me some time to do more like this:
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/kon.foo)

## Developmen References:

This is a list of resources and inspirations I used to create this plugin. I will transform this to a proper credits section in the future.

### Other Translation Plugins:
- [Obsidian Deepl Plugin](https://github.com/friebetill/obsidian-deepl)
- [Obsidian Translate Plugin](https://github.com/Fevol/obsidian-translate)

### Plugins that use Editor Extensions:
- [Editor Extensions in Dataview](https://github.com/blacksmithgu/obsidian-dataview/blob/e4a6cab97b628deb22d36b73ce912abca541ad42/src/ui/lp-render.ts#L133)
- [Smart Typography](https://github.com/mgmeyers/obsidian-smart-typography/)
- [Cursor Location](https://github.com/spslater/obsidian-cursor-location-plugin)

### Plugins that use SafeStorage:
- [Obsidian AI Research Assistant](https://github.com/InterwebAlchemy/obsidian-ai-research-assistant/blob/main/src/views/SettingsTab.ts)

