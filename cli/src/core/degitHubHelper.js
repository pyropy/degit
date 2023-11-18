const Web3 = require('web3');
const { Contract } = require('web3-eth-contract');

const DegitHubABI = require('../DegitHubAbi.json');

class DegitHubHelper {
    constructor(providerUrl, contractAddress) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
        this.degitHubContract = new Contract(DegitHubABI, contractAddress, { from: this.web3.eth.defaultAccount });
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

module.exports = DegitHubHelper;
