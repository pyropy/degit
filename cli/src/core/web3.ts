import { ethers } from "ethers";
import {
  LilypadConfig,
  loadGlobalConfig,
  loadRepositoryConfig,
} from "./config";

export const newProvider = (config: Pick<LilypadConfig, "web3RpcUrl">) => {
  return new ethers.JsonRpcProvider(config.web3RpcUrl);
};

// loadEth loads ethereum contract and account
export const loadEth = () => {
  // Replace with your contract address and ABI
  const repoConfig = loadRepositoryConfig();
  const accountConfig = loadGlobalConfig();
  const provider = newProvider(accountConfig);
  const wallet = new ethers.Wallet(accountConfig.web3PrivateKey, provider);
  // Create a new contract instance
  const contract = new ethers.Contract(
    repoConfig.address,
    repoConfig.abi,
    wallet
  );

  return { contract, wallet };
};
