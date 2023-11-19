export default class DegitHubHelper {
    constructor(identityStr: string, providerUrl: string, contractAddress: string);

    getRepoGroupId(repoName: string): any;
    addRepository(fromAddress: string, repoName: string, groupId: number, merkleTreeRoot: number, merkleTreeDepth: number): Promise<any>;
    updateBranchHead(fromAddress: string, repoName: string, branchName: string, newHeadCommitHash: string, signal: number, nullifierHash: number, externalNullifier: number, proof: number[]): Promise<any>;
    getBranchHead(repoName: string, branchName: string): Promise<string>;
    
    static generateSemaphoreIdentity(): { identity: string; commitment: string };
    static getChainGroups(): { groups: any }
    static getChainGroup(groupId: string): { group: any }
    static getChainGroupMembers(groupId: string): { members: any }
    static getChainIsMember(groupId: string, memberId: string): { isMember: boolean }
}