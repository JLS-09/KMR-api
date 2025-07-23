import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { scheduleJob } from "node-schedule";
import { Mod } from "src/models/mod.model";
import { Version } from "src/models/version.model";

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
  readdirSync("./public/ckan-meta/").forEach(file => {
    const stats = statSync(`./public/ckan-meta/${file}`);
    if (!file.startsWith(".") && stats.isDirectory()) {
      const versions: string[] = [];
      readdirSync(`./public/ckan-meta/${file}`).forEach(version => versions.push(version))

      const latestVersion = JSON.parse(readFileSync(`./public/ckan-meta/${file}/${versions[versions.length - 1]}`, { encoding: "utf8" }));
      
      upsertMod({ _id: file }, { $set: { 
        name: latestVersion.name,
        abstract: latestVersion.abstract,
        author: latestVersion.author,
        description: latestVersion.description,
        release_status: latestVersion.release_status,
        tags: latestVersion.tags,
        resources: latestVersion.resources
      }})
        .then(console.log)
        .catch(console.error);
      
      versions.forEach(version => {
        const versionJson = JSON.parse(readFileSync(`./public/ckan-meta/${file}/${version}`, { encoding: "utf8" }));
        upsertVersion({ _id: version.slice(0, version.lastIndexOf(".")) },  { $set: { 
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
        }}).then(console.log).catch(console.error);

      })
      
    }
  })
}

async function upsertMod(query: { _id: string }, update: { $set: object }) {
  const result = await Mod.findOneAndUpdate(query, update, { upsert: true, new: true });
  return result;
}

async function upsertVersion(query: { _id: string }, update: { $set: object }) {
  const result = await Version.findOneAndUpdate(query, update, { upsert: true, new: true });
  return result;
}

export default function scheduleGitActions() {
  performGitActions();
  scheduleJob('*/30 * * * *', performGitActions);
}
