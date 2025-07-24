import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { scheduleJob } from "node-schedule";
import { Mod } from "src/models/mod.model";
import { Version } from "src/models/version.model";
import { ModUpdate } from "src/types/mod";
import { VersionUpdate } from "src/types/version";

const git: SimpleGit = simpleGit("./public/ckan-meta/").clean(CleanOptions.FORCE);

async function performGitActions() {
  try {
    if (!existsSync("./public/ckan-meta")) {
      await git.clone("https://github.com/KSP-CKAN/CKAN-meta.git", "./public/ckan-meta/");
      console.log(`Repository cloned successfully`);
    } else {
      await git.pull("origin", "master");
      console.log(`Pulling succesfull`);
    }
    populateMods();
  } catch (error) {
      console.error('Error cloning repository:', error.message);
  }
}

async function populateMods() {
  const files: string[] = [];
  const mods = [];
  const versions = [];
  readdirSync("./public/ckan-meta/").forEach(mod => files.push(mod));
 
  for (const file of files) {
    const stats = statSync(`./public/ckan-meta/${file}`);
    if (!file.startsWith(".") && stats.isDirectory()) {
      const versionIds: string[] = [];
      readdirSync(`./public/ckan-meta/${file}`).forEach(version => {
        if (version.endsWith(".ckan")) {
          versionIds.push(version);
        }
      });
      
      if (versionIds.length > 0) {
        const latestVersion = JSON.parse(readFileSync(`./public/ckan-meta/${file}/${versionIds[versionIds.length - 1]}`, { encoding: "utf8" }));
        mods.push(new Mod({
          _id: latestVersion.identifier,
          name: latestVersion.name,
          abstract: latestVersion.abstract,
          author: latestVersion.author,
          description: latestVersion.description,
          release_status: latestVersion.release_status,
          tags: latestVersion.tags,
          resources: latestVersion.resources
        }))      
      }

      for (const version of versionIds) {
        const versionJson = JSON.parse(readFileSync(`./public/ckan-meta/${file}/${version}`, { encoding: "utf8" }));

        versions.push(new Version({ 
          _id: version.slice(0, version.lastIndexOf(".")),
          spec_version: versionJson.spec_version,
          identifier: versionJson.identifier,
          download: versionJson.download,
          license: versionJson.license,
          version: versionJson.version,
          install: versionJson.install,
          comment: versionJson.comment,
          ksp_version: versionJson.ksp_version,
          ksp_version_min: versionJson.ksp_version_min,
          ksp_version_max: versionJson.ksp_version_max,
          ksp_version_strict: versionJson.ksp_version_strict,
          localizations: versionJson.localizations,
          download_size: versionJson.download_size,
          download_hash: versionJson.download_hash,
          download_content_type: versionJson.download_content_type,
          install_size: versionJson.install_size,
          release_date: versionJson.release_date,
          depends: versionJson.depends,
          recommends: versionJson.recommends,
          suggests: versionJson.suggests,
          supports: versionJson.supports,
          conflicts: versionJson.conflicts,
          replaced_by: versionJson.replaced_by,
          kind: versionJson.kind,
          provides: versionJson.provides,
        }))

      }
    }
  }
  await bulkSaveMods(mods as ModUpdate[]).then(console.log).catch(console.error);
  await bulkSaveVersions(versions as VersionUpdate[]).then(console.log).catch(console.error);
  
}

async function bulkSaveMods(mods: ModUpdate[]) {
  const operations = mods.map(mod => ({
    updateOne: {
      filter: { _id: mod._id },
      update: { $set: {
          name: mod.name,
          abstract: mod.abstract,
          author: mod.author,
          description: mod.description,
          release_status: mod.release_status,
          tags: mod.tags,
          resources: mod.resources
      }},
      upsert: true
      }
    }));
  const result = await Mod.bulkWrite(operations);
  return result;
}

async function bulkSaveVersions(versions: VersionUpdate[]) {
  const operations = versions.map(version => ({
    updateOne: {
      filter: { _id: version._id },
      update: { $set: { 
          spec_version: version.spec_version,
          identifier: version.identifier,
          download: version.download,
          license: version.license,
          version: version.version,
          install: version.install,
          comment: version.comment,
          ksp_version: version.ksp_version,
          ksp_version_min: version.ksp_version_min,
          ksp_version_max: version.ksp_version_max,
          ksp_version_strict: version.ksp_version_strict,
          localizations: version.localizations,
          download_size: version.download_size,
          download_hash: version.download_hash,
          download_content_type: version.download_content_type,
          install_size: version.install_size,
          release_date: version.release_date,
          depends: version.depends,
          recommends: version.recommends,
          suggests: version.suggests,
          supports: version.supports,
          conflicts: version.conflicts,
          replaced_by: version.replaced_by,
          kind: version.kind,
          provides: version.provides,
        }},
      upsert: true
      }
    }));
  const result = await Version.bulkWrite(operations);
  return result;
}

export default function scheduleGitActions() {
  performGitActions();
  scheduleJob('*/30 * * * *', performGitActions);
}
