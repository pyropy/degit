import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Identity } from "@semaphore-protocol/identity";
import DegitHubAbi from '../DegitHubAbi.json' assert { type: 'json' };

class DegitHubHelper {
    constructor(identityStr, providerUrl, contractAddress) {
        this.identity = new Identity(identityStr);
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
        this.degitHubContract = new Contract(DegitHubAbi, contractAddress, { from: this.web3.eth.defaultAccount });
    }

    static generateSemaphoreIdentity() {
        const identity = new Identity();
        return { identity: identity.toString(), commitment: identity.commitment.toString() };
    }

    async generateProof (group, externalNullifier, signal) {
        const fullProof = generateProof(new Identity(this.identity), group, externalNullifier, signal);
        return fullProof;
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
}

export default DegitHubHelper;