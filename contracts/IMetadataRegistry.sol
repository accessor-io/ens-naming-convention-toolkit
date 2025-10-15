// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ENSMetadataTypes.sol";

/// @title IMetadataRegistry Interface
/// @notice Core interface for ENS Contract Metadata Registry
/// @dev Defines functions for registering, updating, and querying contract metadata
interface IMetadataRegistry {
    /// @notice Register new contract metadata
    /// @param metadataHash SHA-256 hash of the metadata
    /// @param gateway CCIP gateway URL for metadata retrieval
    /// @param path Path to metadata file on the gateway
    /// @param chainId Source chain ID for cross-chain records
    function registerMetadata(
        bytes32 metadataHash,
        string calldata gateway,
        string calldata path,
        uint256 chainId
    ) external;

    /// @notice Update existing metadata record
    /// @param metadataHash SHA-256 hash of the metadata
    /// @param gateway New CCIP gateway URL
    /// @param path New path to metadata file
    function updateMetadata(
        bytes32 metadataHash,
        string calldata gateway,
        string calldata path
    ) external;

    /// @notice Revoke metadata record
    /// @param metadataHash SHA-256 hash of the metadata to revoke
    function revokeMetadata(bytes32 metadataHash) external;

    /// @notice Get metadata record by hash
    /// @param metadataHash SHA-256 hash of the metadata
    /// @return record Complete metadata record
    function getMetadataRecord(bytes32 metadataHash)
        external view
        returns (ENSMetadataTypes.MetadataRecord memory record);

    /// @notice Check if metadata hash is registered
    /// @param metadataHash SHA-256 hash of the metadata
    /// @return active Whether the record is active
    function isMetadataActive(bytes32 metadataHash) external view returns (bool active);

    /// @notice Authorize or deauthorize an attester
    /// @param attester Address to authorize/deauthorize
    /// @param authorized Whether the address should be authorized
    function setAuthorizedAttester(address attester, bool authorized) external;

    /// @notice Check if address is authorized attester
    /// @param attester Address to check
    /// @return authorized Whether the address is authorized
    function isAuthorizedAttester(address attester) external view returns (bool authorized);

    /// @notice Set supported chain for cross-chain operations
    /// @param chainId Chain ID to support
    /// @param supported Whether the chain should be supported
    function setSupportedChain(uint256 chainId, bool supported) external;

    /// @notice Check if chain is supported for cross-chain operations
    /// @param chainId Chain ID to check
    /// @return supported Whether the chain is supported
    function isSupportedChain(uint256 chainId) external view returns (bool supported);

    /// @notice Get the total number of active metadata records
    /// @return count Total number of active records
    function getActiveMetadataCount() external view returns (uint256 count);

    /// @notice Get metadata hashes by attester
    /// @param attester Address of the attester
    /// @return hashes Array of metadata hashes attested by the address
    function getMetadataHashesByAttester(address attester)
        external view
        returns (bytes32[] memory hashes);

    /// @notice Get metadata hashes by chain ID
    /// @param chainId Chain ID to filter by
    /// @return hashes Array of metadata hashes for the chain
    function getMetadataHashesByChain(uint256 chainId)
        external view
        returns (bytes32[] memory hashes);

    /// @notice Assign metadata to another chain via CCIP
    /// @param targetChainId Chain ID where metadata should be available
    /// @param message Cross-chain assignment message
    function assignCrossChainMetadata(
        uint256 targetChainId,
        ENSMetadataTypes.MetadataAssignmentMessage calldata message
    ) external;

    /// @notice Verify metadata attestation signature
    /// @param metadataHash Hash of the metadata being attested
    /// @param attester Address that created the attestation
    /// @param signature Signature to verify
    /// @return valid Whether the signature is valid
    function verifyAttestation(
        bytes32 metadataHash,
        address attester,
        bytes calldata signature
    ) external view returns (bool valid);

    /// @notice Get registry statistics
    /// @return totalRecords Total number of records ever created
    /// @return activeRecords Number of currently active records
    /// @return totalAttesters Number of authorized attesters
    /// @return supportedChainsCount Number of supported chains
    function getRegistryStats() external view returns (
        uint256 totalRecords,
        uint256 activeRecords,
        uint256 totalAttesters,
        uint256 supportedChainsCount
    );
}
