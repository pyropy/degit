import Web3 from 'web3';
import { Identity } from "@semaphore-protocol/identity";
import DegitHubAbi from '../DegitHubAbi.json' assert { type: 'json' };
import { ApiSdk } from '@bandada/api-sdk';
import { SemaphoreEthers } from "@semaphore-protocol/data";

const chain = "goerli";

class DegitHubHelper {

    constructor(identityStr, providerUrl, contractAddress) {
        this.identity = new Identity(identityStr);
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
        this.degitHubContract = new this.web3.eth.Contract(DegitHubAbi, contractAddress);
    }

    static generateSemaphoreIdentity() {
        const identity = new Identity();
        return { identity: identity.toString(), commitment: identity.commitment.toString() };
    }

    async generateProof (group, externalNullifier, signal) {
        const fullProof = generateProof(new Identity(this.identity), group, externalNullifier, signal);
        return fullProof;
    }

    async getRepoGroupId (repoName) {
        const repoGroupId = await this.degitHubContract.methods.repositories(repoName).call();
        return repoGroupId.groupId;
    }

    async addRepository(fromAddress, repoName, groupId, merkleTreeRoot, merkleTreeDepth) {
        const gasEstimate = await this.degitHubContract.methods.addRepository(repoName, groupId, merkleTreeRoot, merkleTreeDepth).estimateGas({ from: fromAddress });
        return this.degitHubContract.methods.addRepository(repoName, groupId, merkleTreeRoot, merkleTreeDepth)
            .send({ from: fromAddress, gas: gasEstimate });
    }

    async updateBranchHead(fromAddress, repoName, branchName, newHeadCommitHash, signal, nullifierHash, externalNullifier, proof) {
        const gasEstimate = await this.degitHubContract.methods.updateBranchHead(repoName, branchName, newHeadCommitHash, signal, nullifierHash, externalNullifier, proof).estimateGas({ from: fromAddress });
        return this.degitHubContract.methods.updateBranchHead(repoName, branchName, newHeadCommitHash, signal, nullifierHash, externalNullifier, proof)
            .send({ from: fromAddress, gas: gasEstimate });
    }

    async getBranchHead(repoName, branchName) {
        return this.degitHubContract.methods.getBranchHead(repoName, branchName).call();
    }

    static async getChainGroups() {
        const bandada = new ApiSdk();
        const groups = await bandada.getGroups();
        return groups;
    }

    static async getOffchainGroup(groupId) {
        const bandada = new ApiSdk();
        const group = await bandada.getGroup(groupId);
        return group;
    }

    static async getOffhainIsMember(groupId, memberId) {
        const bandada = new ApiSdk();
        const isGroupMember = await bandada.isGroupMember(groupId, memberId);
        return isGroupMember;
    }

    static async getChainGroups() {
        const semaphoreEthers = new SemaphoreEthers(chain);
        const groupIds = await semaphoreEthers.getGroupIds();
        return groupIds;
    }

    static async getChainGroup(groupId) {
        const semaphoreEthers = new SemaphoreEthers(chain);
        const groupIds = await semaphoreEthers.getGroup(groupId);
        return groupIds;
    }

    static async getChainGroupMembers(groupId) {
        const semaphoreEthers = new SemaphoreEthers(chain);
        const members = await semaphoreEthers.getGroupMembers(groupId);
        return members;
    }

    static async getChainIsMember(groupId, memberId) {
        const members = await this.getChainGroupMembers(groupId);
        return members.includes(memberId);
    }
}

export default DegitHubHelper;