const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const manifestJsonPath = path.join(__dirname, 'manifest.json');
const manifestContent = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
const currentPluginName = manifestContent.name;
const currentPluginSlug = manifestContent.id;
const currentPluginPascalCase = camelize(currentPluginName).charAt(0).toUpperCase() + camelize(currentPluginName).slice(1);

function replaceInFile(filePath, currentValueRegex, replaceValue) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(currentValueRegex, replaceValue);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function isValidName(name) {
  return /^[a-zA-Z0-9\s]+$/.test(name);
}

function updateProject() {
  rl.question(`Enter your plugin name (current: "${currentPluginName}"): `, (pluginName) => {
    if (!isValidName(pluginName)) {
      console.log("Invalid plugin name. Please use only alphanumeric characters and spaces.");
      rl.close();
      return;
    }
    pluginName = pluginName || currentPluginName;
    const slug = pluginName.toLowerCase().replace(/ /g, '-');
    const camelCaseName = camelize(pluginName);
    const pascalCaseName = camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);


    // Paths to the files you want to update
    const manifestJsonPath = path.join(__dirname, 'manifest.json');
    const packageJsonPath = path.join(__dirname, 'package.json');
    const mainTsPath = path.join(__dirname, 'main.ts');
    // const esbuildConfigPath = path.join(__dirname, 'esbuild.config.mjs');
    const communityPluginsJsonPath = path.join(__dirname, 'testVault', 'community-plugins.json');

    // Name replacement
    replaceInFile(manifestJsonPath, new RegExp(`"name": "${currentPluginName}"`), `"name": "${pluginName}"`);
    replaceInFile(mainTsPath, new RegExp(`${currentPluginName}`, "g"), `${pluginName}`);

    // SLUG replacement
    replaceInFile(manifestJsonPath, new RegExp(`"id": "${currentPluginSlug}"`), `"id": "${slug}"`);
    replaceInFile(packageJsonPath, new RegExp(`"name": "${currentPluginSlug}"`), `"name": "${slug}"`);
    replaceInFile(communityPluginsJsonPath, new RegExp(`"plugin-template"`), `"${slug}"`);
    replaceInFile(mainTsPath, new RegExp(`plugin-template`, "g"), slug);

    // PascalCase replacement
    replaceInFile(mainTsPath, new RegExp(`PluginTemplate`, "g"), pascalCaseName);

    console.log('Project customized successfully.');
    rl.close();
  });
}

updateProject();