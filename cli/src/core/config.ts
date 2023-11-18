import path from "path";
import fs from "fs";
import os from "os";

export type RepositoryConfig = {
  name: string; // repository name
  address: string; // address to the semaphore contract
};

export type AccountConfig = {
  web3PublicKey: string; // public key
  web3PrivateKey: string; // private key
};

export type LilypadConfig = {
  web3ChainId: string;
  web3ProviderUrl: string;
  web3RpcUrl: string;
  web3ControllerAddress: string;
  web3TokenAddress: string;
  web3MediationAddress: string;
  web3JobCreatorAddress: string;
  web3PaymentsAddress: string;
  web3StorageAddress: string;
  web3UsersAddress: string;
  serviceSolver: string;
  serviceMediators: string;
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

// loadGlobalConfig tries to load account config from the degit config directory
export const loadGlobalConfig = (): AccountConfig & LilypadConfig => {
  const homePath = os.homedir();
  const configPath = path.join(homePath, ".degit/config.json");
  const config = fs.readFileSync(configPath, "utf8");
  return JSON.parse(config);
};
