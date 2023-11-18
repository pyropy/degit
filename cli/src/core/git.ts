import { execSync } from "child_process";

export const getCurrentBranch = (): string => {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
};
