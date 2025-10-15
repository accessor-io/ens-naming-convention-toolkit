// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ENSMetadataTypes.sol";

/// @title IMetadataValidator Interface
/// @notice Interface for validating ENS contract metadata against ENSIP-X standards
/// @dev Defines functions for automated validation and verification of metadata
interface IMetadataValidator {
    /// @notice Validate complete contract metadata structure
    /// @param metadata Contract metadata to validate
    /// @return result Validation result with errors and warnings
    function validateContractMetadata(ENSMetadataTypes.ContractMetadata calldata metadata)
        external view
        returns (ENSMetadataTypes.ValidationResult memory result);

    /// @notice Validate metadata hash against stored content
    /// @param metadataHash Hash of the metadata
    /// @param content Actual metadata content
    /// @return valid Whether the hash matches the content
    function validateMetadataHash(bytes32 metadataHash, string calldata content)
        external pure
        returns (bool valid);

    /// @notice Validate canonical ID format and structure
    /// @param id Canonical contract ID to validate
    /// @return valid Whether the ID format is correct
    function validateCanonicalId(string calldata id)
        external pure
        returns (bool valid);

    /// @notice Validate interface definitions
    /// @param interfaces Array of interface definitions to validate
    /// @return result Validation result for interfaces
    function validateInterfaces(ENSMetadataTypes.ContractInterface[] calldata interfaces)
        external pure
        returns (ENSMetadataTypes.ValidationResult memory result);

    /// @notice Validate security information
    /// @param security Security information to validate
    /// @return result Validation result for security info
    function validateSecurity(ENSMetadataTypes.Security calldata security)
        external view
        returns (ENSMetadataTypes.ValidationResult memory result);

    /// @notice Validate deployment information
    /// @param deployment Deployment information to validate
    /// @return result Validation result for deployment info
    function validateDeployment(ENSMetadataTypes.Deployment calldata deployment)
        external view
        returns (ENSMetadataTypes.ValidationResult memory result);

    /// @notice Validate standards compliance
    /// @param standards Standards information to validate
    /// @return result Validation result for standards
    function validateStandards(ENSMetadataTypes.Standards calldata standards)
        external pure
        returns (ENSMetadataTypes.ValidationResult memory result);

    /// @notice Validate cross-chain consistency
    /// @param metadataArray Array of metadata from different chains
    /// @return consistent Whether metadata is consistent across chains
    function validateCrossChainConsistency(ENSMetadataTypes.ContractMetadata[] calldata metadataArray)
        external pure
        returns (bool consistent);

    /// @notice Validate attestation signature
    /// @param metadataHash Hash of the metadata being attested
    /// @param attester Address that created the attestation
    /// @param signature Signature to validate
    /// @return valid Whether the signature is valid
    function validateAttestation(
        bytes32 metadataHash,
        address attester,
        bytes calldata signature
    ) external view returns (bool valid);

    /// @notice Get validation rules version
    /// @return version Version of the validation rules
    function getValidationRulesVersion() external pure returns (string memory version);

    /// @notice Check if validator supports specific validation type
    /// @param validationType Type of validation to check
    /// @return supported Whether the validation type is supported
    function supportsValidation(string calldata validationType)
        external pure
        returns (bool supported);

    /// @notice Get list of supported validation types
    /// @return validationTypes Array of supported validation types
    function getSupportedValidationTypes()
        external pure
        returns (string[] memory validationTypes);

    /// @notice Batch validate multiple metadata records
    /// @param metadataArray Array of metadata to validate
    /// @return results Array of validation results
    function batchValidateMetadata(ENSMetadataTypes.ContractMetadata[] calldata metadataArray)
        external view
        returns (ENSMetadataTypes.ValidationResult[] memory results);

    /// @notice Validate metadata against custom rules
    /// @param metadata Metadata to validate
    /// @param customRules Custom validation rules as JSON string
    /// @return result Validation result including custom rule results
    function validateWithCustomRules(
        ENSMetadataTypes.ContractMetadata calldata metadata,
        string calldata customRules
    ) external view returns (ENSMetadataTypes.ValidationResult memory result);
}
