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
    const account = ethers.Wallet.createRandom();
    const keys = {
      web3PublicKey: account.address,
      web3PrivateKey: account.privateKey,
    };

    // hardcode lilypad config for now
    const lilypadConfig = {
      web3ChainId: "11155111",
      web3ProviderUrl: options.rpc,
      web3RpcUrl: options.rpc,
      web3ControllerAddress: "0x433C91FA54b9c11550b07672E1FA2b06860e5b05",
      web3TokenAddress: "0x90bC5e91B2bC6BBa240001B169fd73DeA75E072A",
      web3MediationAddress: "0xe294485d0C03adCe1BE2c2791522A6c0585A4f7B",
      web3JobCreatorAddress: "0x4aC3C9F7e431dce628440b5037d23890c28E5C3F",
      web3PaymentsAddress: "0xC5b1737A2282E6283c54f67bC401426058BC170F",
      web3StorageAddress: "0x79Ee2d28eDDd9Ee0b68613b29Dab474623F8D1c6",
      web3UsersAddress: "0x70eC3b0aFA059174dD54d7702624f1Dd402b706b",
      serviceSolver: "0x08D118d3300c82CD94a4080805426AB025fe9852",
      serviceMediators: "0xd6244f8c08d4b7bb7ccbd72e585b19ee68a8d1eb",
    };

    if (!fs.existsSync(deGitDir)) {
      fs.mkdirSync(deGitDir);
      fs.writeFileSync(
        path.join(deGitDir, "config.json"),
        JSON.stringify({ ...keys, ...lilypadConfig })
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
