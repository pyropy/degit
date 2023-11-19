#!/usr/bin/env ts-node --esm

import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import os from "os";
import fs from "fs";
import { exec, execSync } from "child_process";
import { RepositoryConfig } from "./core/config";
import { ethers } from "ethers";
import { loadEth } from "./core/web3";
import { COMMIT_MSG_HOOK } from "./core/hooks";

const program = new Command();
const logo = figlet.textSync("deGit");

program.name("degit").version("1.0.0").description(logo);

program
  .command("setup")
  .description("Setup deGit on your machine")
  .option("-r, --rpc <string>", "url to the rpc provider")
  .action((options) => {
    // Setup directory in home directory
    const homeDir = os.homedir();
    const deGitDir = path.join(homeDir, ".degit");
    const templateDir = path.join(homeDir, ".degit/template");
    const hooksDir = path.join(homeDir, ".degit/template/hooks");
    const account = ethers.Wallet.createRandom();
    const keys = {
      web3PublicKey: account.address,
      web3PrivateKey: account.privateKey,
    };

    // hardcode lilypad config for now
    const rpcConfig = {
      web3RpcUrl: options.rpc,
    };

    if (!fs.existsSync(deGitDir)) {
      fs.mkdirSync(deGitDir);
      fs.mkdirSync(templateDir);
      fs.mkdirSync(hooksDir);
      fs.writeFileSync(
        path.join(deGitDir, "config.json"),
        JSON.stringify({ ...keys, ...rpcConfig })
      );
      fs.writeFileSync(
        path.join(hooksDir, "commit-msg"),
        COMMIT_MSG_HOOK.trim()
      );
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
  .action((relativePath: string, config: RepositoryConfig) => {
    const homeDir = os.homedir();
    const templateDir = path.join(homeDir, ".degit/template");
    const serializedConfig = JSON.stringify(config);
    const absPath = path.resolve(relativePath);
    const deGitDir = `${absPath}/.degit`;
    fs.mkdirSync(deGitDir);
    console.log("init", absPath);
    // Create a new git repository
    execSync(`git init ${absPath} --template=${templateDir}`);
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
    exec(`git push ipld:: ${branch}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      const { contract } = loadEth();
      const output = stderr.trim();
      const cidRegex = /ipld:\/\/(\w+)/;
      const match = output.match(cidRegex);
      if (match) {
        const cid = match[1];

        await contract.setCID(branch, cid);
      } else {
        console.log("No CID found in the output");
      }
    });
  });

program
  .command("checkout")
  .argument("<branch>")
  .description("Checks out newest HEAD from the dgit repository")
  .action(async (branch: string) => {
    const { contract } = loadEth();
    const cid = await contract.getCID(branch);

    console.log(cid);
  });

program.parse(process.argv);
