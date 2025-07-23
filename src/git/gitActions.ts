import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { scheduleJob } from "node-schedule";
import { Mod } from "src/models/mod.model";

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
    const versions: string[] = [];
    const stats = statSync(`./public/ckan-meta/${file}`);
    if (!file.startsWith(".") && stats.isDirectory()) {
      readdirSync(`./public/ckan-meta/${file}`).forEach(version => versions.push(version))

      const latestVersion = JSON.parse(readFileSync(`./public/ckan-meta/${file}/${versions[versions.length - 1]}`, { encoding: "utf8" }));
      
      upsertDocument({ _id: file }, { $set: { 
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

    }
  })
}

async function upsertDocument(query: { _id: string }, update: { $set: object }) {
  const result = await Mod.findOneAndUpdate(query, update, { upsert: true, new: true });
  return result;
}

export default function scheduleGitActions() {
  performGitActions();
  scheduleJob('*/15 * * * *', performGitActions);
}
