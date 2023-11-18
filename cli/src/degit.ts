#!/usr/bin/env ts-node --esm
import { Command } from "commander";
import figlet from "figlet";
import path from "path";
import os from "os";
import fs from "fs";
import { exec, execSync } from "child_process";
import {
  RepositoryConfig,
  loadAccountConfig,
  loadRepositoryConfig,
} from "./core/config";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
const program = new Command();
const logo = figlet.textSync("deGit");

// loadEth loads ethereum contract and account
const loadEth = () => {
  // Replace with your contract address and ABI
  const repoConfig = loadRepositoryConfig();
  const accountConfig = loadAccountConfig();
  const wallet = new ethers.Wallet(accountConfig.private, provider);
  // Create a new contract instance
  const contract = new ethers.Contract(
    repoConfig.address,
    repoConfig.abi,
    wallet
  );

  return { contract, wallet };
};

program.name("degit").version("1.0.0").description(logo);

program
  .command("setup")
  .description("Setup deGit on your machine")
  .action(() => {
    // Setup directory in home directory
    const homeDir = os.homedir();
    const deGitDir = path.join(homeDir, ".degit");
    const account = ethers.Wallet.createRandom();
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
  .action((relativePath: string, config: RepositoryConfig) => {
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
