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
git submodule update --init --recursive
git add .gitmodules .devcontainer
git add .gitmodules testVault
```

4. Let VSCode do its magic and build the DevContainer. You need the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed and of course [Docker](https://www.docker.com/products/docker-desktop) up and running.

- Open the repository in VSCode
- Click on the green "Open a Remote Window" button in the bottom left corner or press `Ctrl+Shift+P` and select `Dev-Containers: Reopen in Container`

5. Customize your plugin:
```bash
npm run setup
```


...
.... Create a new repository on GitHub and push the code to it:
`git remote add origin <new-plugin-repo-url>`

To update the DevContainer submodule to the latest version:
`git submodule update --remote --merge`




## Releasing new releases
Update your manifest.json with your new version number, such as 1.0.1, and the minimum Obsidian version required for your latest release.
Update your versions.json file with "new-plugin-version": "minimum-obsidian-version" so older versions of Obsidian can download an older version of your plugin that's compatible.
Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix v. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
Upload the files manifest.json, main.js, styles.css as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
Publish the release.
You can simplify the version bump process by running npm version patch, npm version minor or npm version major after updating minAppVersion manually in manifest.json. The command will bump version in manifest.json and package.json, and add the entry for the new version to versions.json