// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@bandada/contracts/protocols/IBandadaSemaphore.sol";

contract DegitHub {
    IBandadaSemaphore public bandadaSemaphore;

    // Structure for representing a branch in a repository
    struct Branch {
        string name;
        string headCommitHash;
    }

    // Structure for representing a repository
    struct Repository {
        uint256 groupId; // Bandada group ID associated with this repository
        uint256 merkleTreeRoot; // Root of the Merkle tree for Semaphore verification
        uint256 merkleTreeDepth; // Depth of the Merkle tree
        mapping(string => Branch) branches; // Mapping of branch names to their corresponding Branch struct
    }

    // Mapping from repository names to their corresponding Repository struct
    mapping(string => Repository) public repositories;

    // Constructor to set the Bandada Semaphore contract address
    constructor(address _bandadaSemaphoreAddress) {
        bandadaSemaphore = IBandadaSemaphore(_bandadaSemaphoreAddress);
    }

    // Function to add a new repository using its name
    // repoName: The name of the repository
    // groupId, merkleTreeRoot, merkleTreeDepth: Semaphore related parameters
    function addRepository(string memory repoName, uint256 groupId, uint256 merkleTreeRoot, uint256 merkleTreeDepth) public {
        require(repositories[repoName].groupId == 0, "Repository already exists");
        Repository storage newRepo = repositories[repoName];
        newRepo.groupId = groupId;
        newRepo.merkleTreeRoot = merkleTreeRoot;
        newRepo.merkleTreeDepth = merkleTreeDepth;
    }

    // Function to update the head commit hash of a branch in a repository
    // repoName: The name of the repository
    // branchName: The name of the branch to update
    // newHeadCommitHash: The new head commit hash for the branch
    // signal, nullifierHash, externalNullifier, proof: Semaphore related parameters for verification
    function updateBranchHead(
        string memory repoName, 
        string memory branchName, 
        string memory newHeadCommitHash, 
        uint256 signal, 
        uint256 nullifierHash, 
        uint256 externalNullifier, 
        uint256[8] calldata proof
    ) 
        public 
    {
        Repository storage repo = repositories[repoName];
        require(repo.groupId != 0, "Repository does not exist");

        // Verify the group membership using BandadaSemaphore
        bandadaSemaphore.verifyProof(
            repo.groupId,
            repo.merkleTreeRoot,
            repo.merkleTreeDepth,
            signal,
            nullifierHash,
            externalNullifier,
            proof
        );

        // Update the branch head if the proof is valid
        Branch storage branch = repo.branches[branchName];
        branch.name = branchName;
        branch.headCommitHash = newHeadCommitHash;
    }

    // Function to get the head commit hash of a branch in a repository
    // repoName: The name of the repository
    // branchName: The name of the branch
    function getBranchHead(string memory repoName, string memory branchName) public view returns (string memory) {
        return repositories[repoName].branches[branchName].headCommitHash;
    }

}
