export default class DegitHubHelper {
    constructor(providerUrl: string, contractAddress: string);

    addRepository(fromAddress: string, repoName: string, groupId: number, merkleTreeRoot: number, merkleTreeDepth: number): Promise<any>;
    updateBranchHead(fromAddress: string, repoName: string, branchName: string, newHeadCommitHash: string, signal: number, nullifierHash: number, externalNullifier: number, proof: number[]): Promise<any>;
    getBranchHead(repoName: string, branchName: string): Promise<string>;
    
    static generateSemaphoreIdentity(): { identity: string; commitment: string };
}