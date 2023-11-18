import path from "path";
import fs from "fs";
import os from "os";

export type RepositoryConfig = {
  name: string; // repository name
  address: string; // address to the semaphore contract
};

export type AccountConfig = {
  address: string; // public key
  private: string; // private key
};

// loadConfig tries to load config from the current working directory
export const loadRepositoryConfig = () => {
  const configPath = path.join(process.cwd(), ".degit/config.json");
  const abiPath = path.join(process.cwd(), ".degit/abi.json");
  const configFile = fs.readFileSync(configPath, "utf8");
  const abiFile = fs.readFileSync(abiPath, "utf8");
  const config = JSON.parse(configFile) as RepositoryConfig;
  const abi = JSON.parse(abiFile);

  return { ...config, abi };
};

// loadConfig tries to load account config from the degit config directory
export const loadAccountConfig = (): AccountConfig => {
  const homePath = os.homedir();
  const configPath = path.join(homePath, ".degit/keys.json");
  const config = fs.readFileSync(configPath, "utf8");
  return JSON.parse(config);
};
