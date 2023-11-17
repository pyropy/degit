const { Command } = require("commander");
const figlet = require("figlet");
const path = require("path");
const os = require("os");
const fs = require("fs");
const program = new Command();
const logo = figlet.textSync("deGit");
const { execSync } = require("child_process");

program.name("deGit").version("1.0.0").description(logo);

program
  .command("setup")
  .description("Setup deGit on your machine")
  .action(() => {
    // Setup directory in home directory
    const homeDir = os.homedir();
    const deGitDir = path.join(homeDir, ".degit");
    if (!fs.existsSync(deGitDir)) {
      fs.mkdirSync(deGitDir);
      console.log(`Created deGit directory at ${deGitDir}`);
    } else {
      console.log("deGit directory already exists");
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
    console.log("init", absPath);
    // Create a new git repository
    execSync(`git init ${absPath}`);
    fs.writeFileSync(path.join(absPath, ".degit.json"), serializedConfig);
  });

program
  .command("push")
  .argument("<branch>")
  .description("Push changes to a branch")
  .action((branch: string) => {
    const output = execSync(`git push ipld:: ${branch}`).toString();
    const cidRegex = /ipld:\/\/(\w+)/;
    const match = output.match(cidRegex);

    if (match) {
      const cid = match[1];
      console.log(`CID: ${cid}`);
    } else {
      console.log("No CID found in the output");
    }
  });
program.parse(process.argv);
