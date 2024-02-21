## Obsidian Plugin Template
Based on the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

## Usage with VSCode Devcontainers
1. Create a new directory for your plugin:
`mkdir my-new-plugin`
2. Clone this repository into your new directory:
`git clone https://github.com/kon-foo/ObsidianPluginTemplate.git`
3. Add the [ObsidianPluginDevContainer](https://github.com/kon-foo/ObsidianPluginDevContainer) repo as a submodule:
`git submodule add https://github.com/kon-foo/ObsidianPluginDevContainer.git .devcontainer`
`git submodule update --init --recursive`

## Releasing new releases
Update your manifest.json with your new version number, such as 1.0.1, and the minimum Obsidian version required for your latest release.
Update your versions.json file with "new-plugin-version": "minimum-obsidian-version" so older versions of Obsidian can download an older version of your plugin that's compatible.
Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix v. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
Upload the files manifest.json, main.js, styles.css as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
Publish the release.
You can simplify the version bump process by running npm version patch, npm version minor or npm version major after updating minAppVersion manually in manifest.json. The command will bump version in manifest.json and package.json, and add the entry for the new version to versions.json