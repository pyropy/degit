import { Web3 } from "web3";
import { AccountConfig } from "./config";

const loadAccount = (web3: Web3, config: AccountConfig) => {
  return web3.eth.accounts.privateKeyToAccount(config.privateKey);
};
