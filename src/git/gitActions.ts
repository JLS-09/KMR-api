import { existsSync, readdirSync } from "node:fs";
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { scheduleJob } from "node-schedule";

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
    console.log(file);
    
  })
}

export default function scheduleGitActions() {
  performGitActions();
  scheduleJob('*/5 * * * *', performGitActions);
}
