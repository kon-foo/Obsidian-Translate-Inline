## Obsidian Plugin Template
This is a template for creating an Obsidian plugin. It extends the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) with a [VSCode DevContainer](https://github.com/kon-foo/ObsidianPluginDevContainer), a [Test Vault](https://github.com/kon-foo/ObsidianPluginTestVault) and some utility scripts and smart presets. After setting things up you should have a fully functional development environment with a test vault, your enabled plugin and hot reloading (cudos to [pjeby](https://github.com/pjeby/hot-reload)). 

## How to use this template
1. Clone this repository into to a new Plugin directory:
```bash
git clone https://github.com/kon-foo/ObsidianPluginTemplate.git MyNewPlugin && cd MyNewPlugin
```

2. Detach the repository from the remote origin:
```bash
git remote remove origin
```

3. Add [ObsidianPluginDevContainer](https://github.com/kon-foo/ObsidianPluginDevContainer) and [ObsidianPluginTestVault](https://github.com/kon-foo/ObsidianPluginTestVault) as a submodules:
```bash
git submodule add https://github.com/kon-foo/ObsidianPluginDevContainer.git .devcontainer
git submodule add https://github.com/kon-foo/ObsidianPluginTestVault.git testVault
git add .gitmodules .devcontainer
git add .gitmodules testVault
```

4. Let VSCode do its magic and build the DevContainer. You need the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed and of course [Docker](https://www.docker.com/products/docker-desktop) up and running.

- Open the repository in VSCode
- Press `Ctrl+Shift+P` and select `Dev-Containers: Reopen in Container`
- After a successfule build, the `setup.js` script will be executed and guides you through the customization. (TBH: At the moment it just asks for your plugin name an replaces it everywhere. Remember to change the other field in the manifest.json)
- Afterwards the watcher starts. On every code change, a new `main.js` file gets build, copied to the test vault and the "Hot Reload" plugin should refresh your Obsidian instance.

5. Open your vault in Obsidian and start developing your plugin. To distinguish visually between the test vault and your real vault, the window frame has an awful yellow title bar. You can change this in [`devVaultSnippet.css`](testVault/snippets/devVaultSnippet.css). 


## How to update the template

To update the submodules (DevContainer and TestVault) to the latest version:
`git submodule update --remote --merge`

## Releasing new releases
[Source](https://github.com/obsidianmd/obsidian-sample-plugin)
Update your manifest.json with your new version number, such as 1.0.1, and the minimum Obsidian version required for your latest release.
Update your versions.json file with "new-plugin-version": "minimum-obsidian-version" so older versions of Obsidian can download an older version of your plugin that's compatible.
Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix v. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
Upload the files manifest.json, main.js, styles.css as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
Publish the release.
You can simplify the version bump process by running npm version patch, npm version minor or npm version major after updating minAppVersion manually in manifest.json. The command will bump version in manifest.json and package.json, and add the entry for the new version to versions.json

## Obsidian Plugin Development Resources
- [Obsidian Plugin Documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [The Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

Feel free to add your own resources to this list.

## Support Me!
If you find these repositories helpful, I would be grateful if you would buy me some time to do more like this:
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/kon.foo)