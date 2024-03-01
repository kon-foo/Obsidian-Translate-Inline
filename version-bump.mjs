
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import semver from 'semver';

// Function to get the next version based on the current version and the type of bump
function getNextVersion(currentVersion, bumpType, exactVersion) {
  if (bumpType === '--version') {
    return exactVersion;
  } else {
    switch (bumpType) {
      case '--patch':
        return semver.inc(currentVersion, 'patch');
      case '--minor':
        return semver.inc(currentVersion, 'minor');
      case '--major':
        return semver.inc(currentVersion, 'major');
      default:
        throw new Error(`Unknown bump type: ${bumpType}`);
    }
  }
}

// Parsing command line arguments
const [bumpType, versionOrBump] = process.argv.slice(2);
console.log(bumpType, versionOrBump);

// Read the current version from package.json
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const currentVersion = packageJson.version;

// Determine the next version
const nextVersion = getNextVersion(currentVersion, bumpType, versionOrBump);

// Update package.json
packageJson.version = nextVersion;
writeFileSync("package.json", JSON.stringify(packageJson, null, "\t"));

// Update manifest.json
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = nextVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// Update versions.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[nextVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

// Git tag the new version
try {
  execSync(`git tag -a ${nextVersion} -m "${nextVersion}"`);
  execSync(`git add manifest.json versions.json package.json`);
  execSync(`git commit -m "Bump version to ${nextVersion}"`);
  console.log(`Successfully tagged version ${nextVersion}`);
} catch (error) {
  console.error('Failed to tag the version in Git:', error);
}
