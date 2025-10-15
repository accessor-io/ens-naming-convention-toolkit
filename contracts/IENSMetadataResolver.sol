// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ENSMetadataTypes.sol";

/// @title IENSMetadataResolver Interface
/// @notice Extended ENS resolver interface for contract metadata
/// @dev Extends standard ENS resolver with metadata-specific functions
interface IENSMetadataResolver {
    /// @notice Get contract metadata for an ENS node
    /// @param node ENS namehash of the domain
    /// @return metadata Contract metadata as JSON string
    function contractMetadata(bytes32 node)
        external view
        returns (string memory metadata);

    /// @notice Get contract interfaces for an ENS node
    /// @param node ENS namehash of the domain
    /// @return interfaces Array of interface information
    function contractInterfaces(bytes32 node)
        external view
        returns (ENSMetadataTypes.ContractInterface[] memory interfaces);

    /// @notice Get security information for an ENS node
    /// @param node ENS namehash of the domain
    /// @return security Security and audit information
    function contractSecurity(bytes32 node)
        external view
        returns (ENSMetadataTypes.Security memory security);

    /// @notice Get deployment information for an ENS node
    /// @param node ENS namehash of the domain
    /// @return deployment Deployment and ownership information
    function contractDeployment(bytes32 node)
        external view
        returns (ENSMetadataTypes.Deployment memory deployment);

    /// @notice Get standards compliance for an ENS node
    /// @param node ENS namehash of the domain
    /// @return standards ERC standards and interfaces
    function contractStandards(bytes32 node)
        external view
        returns (ENSMetadataTypes.Standards memory standards);

    /// @notice Get canonical contract ID for an ENS node
    /// @param node ENS namehash of the domain
    /// @return id Canonical contract identifier
    function contractId(bytes32 node)
        external view
        returns (string memory id);

    /// @notice Get contract addresses across chains for an ENS node
    /// @param node ENS namehash of the domain
    /// @return addresses Array of contract addresses
    function contractAddresses(bytes32 node)
        external view
        returns (address[] memory addresses);

    /// @notice Get metadata hash for an ENS node
    /// @param node ENS namehash of the domain
    /// @return metadataHash SHA-256 hash of the metadata
    function contractMetadataHash(bytes32 node)
        external view
        returns (bytes32 metadataHash);

    /// @notice Get ENS root domain for contract metadata
    /// @param node ENS namehash of the domain
    /// @return ensRoot ENS root domain for this contract
    function contractEnsRoot(bytes32 node)
        external view
        returns (string memory ensRoot);

    /// @notice Check if ENS node has valid contract metadata
    /// @param node ENS namehash of the domain
    /// @return valid Whether the metadata is valid and complete
    function hasValidContractMetadata(bytes32 node)
        external view
        returns (bool valid);

    /// @notice Get complete metadata record for an ENS node
    /// @param node ENS namehash of the domain
    /// @return metadata Complete contract metadata structure
    function getContractMetadata(bytes32 node)
        external view
        returns (ENSMetadataTypes.ContractMetadata memory metadata);

    /// @notice Set contract metadata for an ENS node
    /// @param node ENS namehash of the domain
    /// @param metadata Contract metadata as JSON string
    function setContractMetadata(bytes32 node, string calldata metadata) external;

    /// @notice Set contract metadata hash for an ENS node
    /// @param node ENS namehash of the domain
    /// @param metadataHash SHA-256 hash of the metadata
    function setContractMetadataHash(bytes32 node, bytes32 metadataHash) external;

    /// @notice Set contract interfaces for an ENS node
    /// @param node ENS namehash of the domain
    /// @param interfaces Array of interface information
    function setContractInterfaces(
        bytes32 node,
        ENSMetadataTypes.ContractInterface[] calldata interfaces
    ) external;

    /// @notice Set security information for an ENS node
    /// @param node ENS namehash of the domain
    /// @param security Security and audit information
    function setContractSecurity(
        bytes32 node,
        ENSMetadataTypes.Security calldata security
    ) external;

    /// @notice Set deployment information for an ENS node
    /// @param node ENS namehash of the domain
    /// @param deployment Deployment and ownership information
    function setContractDeployment(
        bytes32 node,
        ENSMetadataTypes.Deployment calldata deployment
    ) external;

    /// @notice Set standards compliance for an ENS node
    /// @param node ENS namehash of the domain
    /// @param standards ERC standards and interfaces
    function setContractStandards(
        bytes32 node,
        ENSMetadataTypes.Standards calldata standards
    ) external;

    /// @notice Validate metadata against ENSIP-X schema
    /// @param node ENS namehash of the domain
    /// @return validationResult Validation result with errors and warnings
    function validateContractMetadata(bytes32 node)
        external view
        returns (ENSMetadataTypes.ValidationResult memory validationResult);

    /// @notice Get metadata version for an ENS node
    /// @param node ENS namehash of the domain
    /// @return version Metadata schema version
    function getMetadataVersion(bytes32 node)
        external view
        returns (string memory version);

    /// @notice Get contract dependencies for an ENS node
    /// @param node ENS namehash of the domain
    /// @return dependencies Contract dependency information
    function getContractDependencies(bytes32 node)
        external view
        returns (ENSMetadataTypes.DependencyInfo memory dependencies);

    /// @notice Get contracts that depend on this contract
    /// @param node ENS namehash of the domain
    /// @return dependents Array of dependent contract domains
    function getContractDependents(bytes32 node)
        external view
        returns (string[] memory dependents);

    /// @notice Verify dependency chain compatibility
    /// @param dependencyChain Array of ENS node hashes in dependency order
    /// @return resolution Compatibility result with issues if any
    function verifyDependencyChain(bytes32[] calldata dependencyChain)
        external view
        returns (ENSMetadataTypes.DependencyResolution memory resolution);

    /// @notice Get dependency graph for a contract
    /// @param node ENS namehash of the domain
    /// @param depth Maximum depth to traverse
    /// @return graph Dependency graph nodes
    function getDependencyGraph(bytes32 node, uint256 depth)
        external view
        returns (ENSMetadataTypes.DependencyNode[] memory graph);

    /// @notice Register dependency relationship
    /// @param dependentDomain Domain that depends on dependencyDomain
    /// @param dependencyDomain Domain being depended upon
    /// @param relationship Type of relationship (uses, implements, extends)
    function registerDependency(
        string calldata dependentDomain,
        string calldata dependencyDomain,
        string calldata relationship
    ) external;

    /// @notice Check interface support for contract metadata functions
    /// @param interfaceID ERC-165 interface identifier
    /// @return supported Whether the interface is supported
    function supportsInterface(bytes4 interfaceID)
        external pure
        returns (bool supported);
}
