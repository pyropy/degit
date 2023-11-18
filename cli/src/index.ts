#!/usr/bin/env ts-node --esm
import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import os from "os";
import fs from "fs";
import { exec, execSync } from "child_process";
import { Config } from "./core/config";
import { Web3 } from "web3";

const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
const program = new Command();
const logo = figlet.textSync("deGit");

program.name("deGit").version("1.0.0").description(logo);

program
  .command("setup")
  .description("Setup deGit on your machine")
  .action(() => {
    // Setup directory in home directory
    const homeDir = os.homedir();
    const deGitDir = path.join(homeDir, ".degit");
    const account = web3.eth.accounts.create();
    const keys = {
      public: account.address,
      private: account.privateKey,
    };

    if (!fs.existsSync(deGitDir)) {
      fs.mkdirSync(deGitDir);
      fs.writeFileSync(path.join(deGitDir, "keys.json"), JSON.stringify(keys));
      console.log(`Created deGit directory at ${deGitDir}`);
    } else {
      console.log("degit directory already exists");
    }
  });

program
  .command("init")
  .argument("<path>")
  .description("Initialize a new repository")
  .option("-n, --name <string>", "name of the repository", ",")
  .option(
    "-a, --address <string>",
    "address of the repository semaphore contract",
    ","
  )
  .action((relativePath: string, config: Config) => {
    const serializedConfig = JSON.stringify(config);
    const absPath = path.resolve(relativePath);
    const deGitDir = `${absPath}/.degit`;
    fs.mkdirSync(deGitDir);
    console.log("init", absPath);
    // Create a new git repository
    execSync(`git init ${absPath}`);
    fs.writeFileSync(path.join(deGitDir, "config.json"), serializedConfig);
  });

program
  .command("add")
  .argument("<file>")
  .description("Add file to the staging area")
  .action((file) => {
    exec(`git add ${file}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return;
      } else if (stderr) {
        console.error(stderr);
        return;
      } else {
        console.log(stdout);
      }
    });
  });

program
  .command("commit")
  .option("-m, --message <string>", "commit message")
  .description("Commit changes")
  .action((options) => {
    exec(
      `git commit -m "${options.message} --author='Anon <anon@degit.org>'"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          return;
        } else if (stderr) {
          console.error(stderr);
          return;
        } else {
          console.log(stdout);
        }
      }
    );
  });

program
  .command("push")
  .argument("<branch>")
  .description("Push changes to a branch")
  .action((branch: string) => {
    exec(`git push ipld:: ${branch}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      const output = stderr.trim();
      const cidRegex = /ipld:\/\/(\w+)/;
      const match = output.match(cidRegex);

      exec(
        "git rev-parse --abbrev-ref HEAD",
        (branchError, branchStdout, branchStderr) => {
          if (branchError) {
            console.error(`exec error: ${branchError}`);
            return;
          }

          const currentBranch = branchStdout.trim();

          if (match) {
            const cid = match[1];
            console.log(`CID: ${cid}`);
          } else {
            console.log("No CID found in the output");
          }

          console.log("Current branch: ", currentBranch);
        }
      );
    });
  });

program.parse(process.argv);
