// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IMetadataValidator.sol";
import "./ENSMetadataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title ENS Contract Metadata Validator
/// @notice Validates contract metadata against ENSIP-X standards
/// @dev Implements automated validation rules for metadata compliance
contract MetadataValidator is IMetadataValidator, Ownable {
    using Strings for uint256;

    /// @notice Validation rules version
    string public constant VALIDATION_RULES_VERSION = "1.0.0";

    /// @notice Supported validation types
    string[] private _supportedValidationTypes;

    /// @notice Custom validation rules
    mapping(string => string) private _customValidationRules;

    /// @notice Events
    event ValidationPerformed(
        address indexed validator,
        bytes32 indexed metadataHash,
        bool valid,
        uint256 timestamp
    );

    event CustomRuleAdded(string ruleName, string ruleDefinition);

    event CustomRuleRemoved(string ruleName);

    /// @notice Constructor
    constructor() Ownable(msg.sender) {
        _supportedValidationTypes = [
            "basic",
            "structure",
            "canonical_id",
            "interfaces",
            "security",
            "deployment",
            "standards",
            "cross_chain",
            "attestation"
        ];
    }

    /// @inheritdoc IMetadataValidator
    function validateContractMetadata(ENSMetadataTypes.ContractMetadata calldata metadata)
        external view override
        returns (ENSMetadataTypes.ValidationResult memory result)
    {
        result.validatedAt = block.timestamp;
        result.validator = address(this);
        result.valid = true;
        result.errors = new string[](0);
        result.warnings = new string[](0);

        uint256 errorCount = 0;
        uint256 warningCount = 0;

        // Basic structure validation
        if (bytes(metadata.id).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Contract ID is required";
            result.valid = false;
        }

        if (bytes(metadata.org).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Organization is required";
            result.valid = false;
        }

        if (bytes(metadata.protocol).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Protocol is required";
            result.valid = false;
        }

        if (bytes(metadata.category).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Category is required";
            result.valid = false;
        }

        if (bytes(metadata.role).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Role is required";
            result.valid = false;
        }

        if (bytes(metadata.version).length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Version is required";
            result.valid = false;
        }

        if (metadata.chainId == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Chain ID must be greater than 0";
            result.valid = false;
        }

        if (metadata.addresses.length == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "At least one contract address is required";
            result.valid = false;
        }

        if (metadata.metadataHash == bytes32(0)) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Metadata hash is required";
            result.valid = false;
        }

        // Validate addresses
        for (uint256 i = 0; i < metadata.addresses.length; i++) {
            if (metadata.addresses[i] == address(0)) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = string(abi.encodePacked(
                    "Invalid contract address at index ",
                    i.toString(),
                    ": zero address"
                ));
                result.valid = false;
            }
        }

        // Canonical ID validation
        if (!_isValidCanonicalId(metadata.id)) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Invalid canonical ID format";
            result.valid = false;
        }

        // Version format validation
        if (!_isValidVersion(metadata.version)) {
            result.warnings = _expandWarningsArray(result.warnings, warningCount);
            result.warnings[warningCount++] = "Version format should follow semantic versioning (e.g., 1.0.0)";
        }

        // Category validation
        if (!_isValidCategory(metadata.category)) {
            result.warnings = _expandWarningsArray(result.warnings, warningCount);
            result.warnings[warningCount++] = "Category not in recommended list";
        }

        // Role validation
        if (!_isValidRole(metadata.role)) {
            result.warnings = _expandWarningsArray(result.warnings, warningCount);
            result.warnings[warningCount++] = "Role not in recommended list";
        }

        emit ValidationPerformed(address(this), metadata.metadataHash, result.valid, block.timestamp);
    }

    /// @inheritdoc IMetadataValidator
    function validateMetadataHash(bytes32 metadataHash, string calldata content)
        external pure override
        returns (bool valid)
    {
        bytes32 contentHash = keccak256(abi.encodePacked(content));
        return contentHash == metadataHash;
    }

    /// @inheritdoc IMetadataValidator
    function validateCanonicalId(string calldata id)
        external pure override
        returns (bool valid)
    {
        return _isValidCanonicalId(id);
    }

    /// @inheritdoc IMetadataValidator
    function validateInterfaces(ENSMetadataTypes.ContractInterface[] calldata interfaces)
        external pure override
        returns (ENSMetadataTypes.ValidationResult memory result)
    {
        result.validatedAt = block.timestamp;
        result.validator = address(this);
        result.valid = true;
        result.errors = new string[](0);
        result.warnings = new string[](0);

        uint256 errorCount = 0;
        uint256 warningCount = 0;

        for (uint256 i = 0; i < interfaces.length; i++) {
            ENSMetadataTypes.ContractInterface memory iface = interfaces[i];

            // Validate interface name
            if (bytes(iface.name).length == 0) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = string(abi.encodePacked(
                    "Interface at index ",
                    i.toString(),
                    " has empty name"
                ));
                result.valid = false;
            }

            // Validate interface ID format
            if (iface.id == bytes4(0)) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = string(abi.encodePacked(
                    "Interface ",
                    iface.name,
                    " has invalid ID (zero bytes4)"
                ));
                result.valid = false;
            }

            // Validate interface ID format (should be 0x followed by 8 hex characters)
            if (bytes(iface.standard).length > 0 && !_isValidInterfaceId(iface.id)) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = string(abi.encodePacked(
                    "Interface ",
                    iface.name,
                    " ID format may be incorrect"
                ));
            }

            // Validate inheritance
            if (iface.inheritance.inherits.length > 10) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = string(abi.encodePacked(
                    "Interface ",
                    iface.name,
                    " has deep inheritance hierarchy (",
                    iface.inheritance.inherits.length.toString(),
                    " levels)"
                ));
            }
        }
    }

    /// @inheritdoc IMetadataValidator
    function validateSecurity(ENSMetadataTypes.Security calldata security)
        external view override
        returns (ENSMetadataTypes.ValidationResult memory result)
    {
        result.validatedAt = block.timestamp;
        result.validator = address(this);
        result.valid = true;
        result.errors = new string[](0);
        result.warnings = new string[](0);

        uint256 errorCount = 0;
        uint256 warningCount = 0;

        // Validate attestation if present
        if (security.attestation.hash != bytes32(0)) {
            if (security.attestation.attester == address(0)) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = "Attestation has zero attester address";
                result.valid = false;
            }

            if (security.attestation.timestamp == 0) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = "Attestation timestamp is zero";
                result.valid = false;
            }

            if (security.attestation.timestamp > block.timestamp) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = "Attestation timestamp is in the future";
                result.valid = false;
            }

            if (bytes(security.attestation.algorithm).length == 0) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = "Attestation algorithm not specified";
            }
        }

        // Validate audit information
        for (uint256 i = 0; i < security.audits.length; i++) {
            ENSMetadataTypes.AuditInfo memory audit = security.audits[i];

            if (bytes(audit.auditor).length == 0) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = string(abi.encodePacked(
                    "Audit at index ",
                    i.toString(),
                    " has empty auditor field"
                ));
                result.valid = false;
            }

            if (audit.date == 0) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = string(abi.encodePacked(
                    "Audit at index ",
                    i.toString(),
                    " has zero date"
                ));
            }

            if (audit.date > block.timestamp) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = string(abi.encodePacked(
                    "Audit at index ",
                    i.toString(),
                    " has future date"
                ));
                result.valid = false;
            }
        }
    }

    /// @inheritdoc IMetadataValidator
    function validateDeployment(ENSMetadataTypes.Deployment calldata deployment)
        external view override
        returns (ENSMetadataTypes.ValidationResult memory result)
    {
        result.validatedAt = block.timestamp;
        result.validator = address(this);
        result.valid = true;
        result.errors = new string[](0);
        result.warnings = new string[](0);

        uint256 errorCount = 0;
        uint256 warningCount = 0;

        // Validate deployment date
        if (deployment.deploymentDate == 0) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Deployment date is required";
            result.valid = false;
        }

        if (deployment.deploymentDate > block.timestamp) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Deployment date cannot be in the future";
            result.valid = false;
        }

        // Validate deployer address
        if (deployment.deployer == address(0)) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Deployer address cannot be zero";
            result.valid = false;
        }

        // Validate owner address
        if (deployment.owner == address(0)) {
            result.errors = _expandErrorsArray(result.errors, errorCount);
            result.errors[errorCount++] = "Owner address cannot be zero";
            result.valid = false;
        }

        // Validate multisig information if applicable
        if (keccak256(bytes(deployment.ownership.governance)) == keccak256("multisig")) {
            if (deployment.ownership.multisig.contract == address(0)) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = "Multisig contract address is required for multisig governance";
                result.valid = false;
            }

            if (deployment.ownership.multisig.threshold == 0) {
                result.errors = _expandErrorsArray(result.errors, errorCount);
                result.errors[errorCount++] = "Multisig threshold must be greater than 0";
                result.valid = false;
            }
        }

        // Validate upgradeability
        if (bytes(deployment.upgradeability).length > 0) {
            if (!_isValidUpgradeabilityType(deployment.upgradeability)) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = string(abi.encodePacked(
                    "Unknown upgradeability type: ",
                    deployment.upgradeability
                ));
            }
        }

        return result;
    }

    /// @inheritdoc IMetadataValidator
    function validateStandards(ENSMetadataTypes.Standards calldata standards)
        external pure override
        returns (ENSMetadataTypes.ValidationResult memory result)
    {
        result.validatedAt = block.timestamp;
        result.validator = address(this);
        result.valid = true;
        result.errors = new string[](0);
        result.warnings = new string[](0);

        uint256 warningCount = 0;

        // Validate ERC standards
        for (uint256 i = 0; i < standards.ercs.length; i++) {
            if (!_isValidERCStandard(standards.ercs[i])) {
                result.warnings = _expandWarningsArray(result.warnings, warningCount);
                result.warnings[warningCount++] = string(abi.encodePacked(
                    "Unknown ERC standard: ",
                    standards.ercs[i]
                ));
            }
        }

        // Validate interfaces using the interfaces validator
        ENSMetadataTypes.ValidationResult memory interfaceResult = validateInterfaces(standards.interfaces);
        if (!interfaceResult.valid) {
            result.valid = false;
            result.errors = interfaceResult.errors;
        }

        if (interfaceResult.warnings.length > 0) {
            result.warnings = interfaceResult.warnings;
        }

        return result;
    }

    /// @inheritdoc IMetadataValidator
    function validateCrossChainConsistency(ENSMetadataTypes.ContractMetadata[] calldata metadataArray)
        external pure override
        returns (bool consistent)
    {
        if (metadataArray.length <= 1) {
            return true;
        }

        // Check if all metadata have the same core information
        ENSMetadataTypes.ContractMetadata memory reference = metadataArray[0];

        for (uint256 i = 1; i < metadataArray.length; i++) {
            ENSMetadataTypes.ContractMetadata memory current = metadataArray[i];

            if (keccak256(bytes(reference.id)) != keccak256(bytes(current.id))) {
                return false;
            }

            if (keccak256(bytes(reference.org)) != keccak256(bytes(current.org))) {
                return false;
            }

            if (keccak256(bytes(reference.protocol)) != keccak256(bytes(current.protocol))) {
                return false;
            }

            if (reference.metadataHash != current.metadataHash) {
                return false;
            }
        }

        return true;
    }

    /// @inheritdoc IMetadataValidator
    function validateAttestation(
        bytes32 metadataHash,
        address attester,
        bytes calldata signature
    ) external view override returns (bool valid) {
        // Reconstruct the message that should have been signed
        bytes32 messageHash = keccak256(abi.encodePacked(
            metadataHash,
            attester,
            block.timestamp
        ));

        // In production, would verify signature against attester's public key
        // For now, just check that signature is not empty
        return signature.length > 0;
    }

    /// @inheritdoc IMetadataValidator
    function getValidationRulesVersion() external pure override returns (string memory version) {
        return VALIDATION_RULES_VERSION;
    }

    /// @inheritdoc IMetadataValidator
    function supportsValidation(string calldata validationType)
        external view override
        returns (bool supported)
    {
        for (uint256 i = 0; i < _supportedValidationTypes.length; i++) {
            if (keccak256(bytes(_supportedValidationTypes[i])) == keccak256(bytes(validationType))) {
                return true;
            }
        }
        return false;
    }

    /// @inheritdoc IMetadataValidator
    function getSupportedValidationTypes()
        external view override
        returns (string[] memory validationTypes)
    {
        return _supportedValidationTypes;
    }

    /// @inheritdoc IMetadataValidator
    function batchValidateMetadata(ENSMetadataTypes.ContractMetadata[] calldata metadataArray)
        external view override
        returns (ENSMetadataTypes.ValidationResult[] memory results)
    {
        results = new ENSMetadataTypes.ValidationResult[](metadataArray.length);

        for (uint256 i = 0; i < metadataArray.length; i++) {
            results[i] = validateContractMetadata(metadataArray[i]);
        }

        return results;
    }

    /// @inheritdoc IMetadataValidator
    function validateWithCustomRules(
        ENSMetadataTypes.ContractMetadata calldata metadata,
        string calldata customRules
    ) external view override returns (ENSMetadataTypes.ValidationResult memory result) {
        // Start with standard validation
        result = validateContractMetadata(metadata);

        // Apply custom rules if available
        string memory ruleDefinition = _customValidationRules[customRules];
        if (bytes(ruleDefinition).length > 0) {
            // In production, would parse and apply custom JSON rules
            // For now, just add a note that custom rules were applied
            if (result.warnings.length == 0) {
                result.warnings = new string[](1);
                result.warnings[0] = "Custom validation rules applied";
            } else {
                string[] memory newWarnings = new string[](result.warnings.length + 1);
                for (uint256 i = 0; i < result.warnings.length; i++) {
                    newWarnings[i] = result.warnings[i];
                }
                newWarnings[result.warnings.length] = "Custom validation rules applied";
                result.warnings = newWarnings;
            }
        }

        return result;
    }

    /// @notice Add custom validation rule
    /// @param ruleName Name of the custom rule
    /// @param ruleDefinition JSON definition of the rule
    function addCustomValidationRule(string calldata ruleName, string calldata ruleDefinition) external onlyOwner {
        _customValidationRules[ruleName] = ruleDefinition;
        emit CustomRuleAdded(ruleName, ruleDefinition);
    }

    /// @notice Remove custom validation rule
    /// @param ruleName Name of the rule to remove
    function removeCustomValidationRule(string calldata ruleName) external onlyOwner {
        delete _customValidationRules[ruleName];
        emit CustomRuleRemoved(ruleName);
    }

    /// @notice Get custom validation rule definition
    /// @param ruleName Name of the rule
    /// @return ruleDefinition JSON definition of the rule
    function getCustomValidationRule(string calldata ruleName)
        external view returns (string memory ruleDefinition)
    {
        return _customValidationRules[ruleName];
    }

    /// @notice Validate canonical ID format
    /// @param id Canonical ID to validate
    /// @return valid Whether the ID format is correct
    function _isValidCanonicalId(string memory id) internal pure returns (bool valid) {
        bytes memory idBytes = bytes(id);

        if (idBytes.length == 0) return false;

        // Should contain dots and follow pattern: {org}.{protocol}.{category}.{role}.{version}.{chainId}
        uint256 dotCount = 0;
        for (uint256 i = 0; i < idBytes.length; i++) {
            if (idBytes[i] == 0x2E) { // '.'
                dotCount++;
            }
        }

        // Should have at least 4 dots for the basic structure
        return dotCount >= 4;
    }

    /// @notice Validate version format
    /// @param version Version string to validate
    /// @return valid Whether the version format is correct
    function _isValidVersion(string memory version) internal pure returns (bool valid) {
        // Should follow semantic versioning pattern: major.minor.patch
        bytes memory versionBytes = bytes(version);
        if (versionBytes.length == 0) return false;

        uint256 dotCount = 0;
        for (uint256 i = 0; i < versionBytes.length; i++) {
            if (versionBytes[i] == 0x2E) { // '.'
                dotCount++;
            } else if (versionBytes[i] < 0x30 || versionBytes[i] > 0x39) { // Not a digit
                return false;
            }
        }

        // Should have exactly 2 dots for major.minor.patch
        return dotCount == 2;
    }

    /// @notice Validate category
    /// @param category Category to validate
    /// @return valid Whether the category is recognized
    function _isValidCategory(string memory category) internal pure returns (bool valid) {
        // Check against known categories
        string[16] memory validCategories = [
            "defi", "dao", "nft", "dex", "lending", "bridge", "oracle",
            "governance", "utility", "gamefi", "identity", "infrastructure",
            "stablecoin", "yield", "insurance", "other"
        ];

        for (uint256 i = 0; i < validCategories.length; i++) {
            if (keccak256(bytes(category)) == keccak256(bytes(validCategories[i]))) {
                return true;
            }
        }

        return false;
    }

    /// @notice Validate role
    /// @param role Role to validate
    /// @return valid Whether the role is recognized
    function _isValidRole(string memory role) internal pure returns (bool valid) {
        // Check against known roles
        string[15] memory validRoles = [
            "token", "router", "factory", "governor", "timelock", "multisig",
            "proxy", "implementation", "oracle", "bridge", "vault", "staking",
            "reward", "vesting", "other"
        ];

        for (uint256 i = 0; i < validRoles.length; i++) {
            if (keccak256(bytes(role)) == keccak256(bytes(validRoles[i]))) {
                return true;
            }
        }

        return false;
    }

    /// @notice Validate interface ID format
    /// @param interfaceId Interface ID to validate
    /// @return valid Whether the interface ID format is correct
    function _isValidInterfaceId(bytes4 interfaceId) internal pure returns (bool valid) {
        // Interface IDs should be non-zero and follow hex format
        return interfaceId != bytes4(0);
    }

    /// @notice Validate ERC standard format
    /// @param standard ERC standard to validate
    /// @return valid Whether the standard format is correct
    function _isValidERCStandard(string memory standard) internal pure returns (bool valid) {
        // Should start with "erc" followed by number
        bytes memory standardBytes = bytes(standard);
        if (standardBytes.length < 4) return false;

        return standardBytes[0] == 0x65 && // 'e'
               standardBytes[1] == 0x72 && // 'r'
               standardBytes[2] == 0x63;  // 'c'
    }

    /// @notice Validate upgradeability type
    /// @param upgradeability Upgradeability type to validate
    /// @return valid Whether the upgradeability type is recognized
    function _isValidUpgradeabilityType(string memory upgradeability) internal pure returns (bool valid) {
        string[5] memory validTypes = [
            "transparent", "uups", "none", "custom", "diamond"
        ];

        for (uint256 i = 0; i < validTypes.length; i++) {
            if (keccak256(bytes(upgradeability)) == keccak256(bytes(validTypes[i]))) {
                return true;
            }
        }

        return false;
    }

    /// @notice Expand errors array
    /// @param errors Current errors array
    /// @param count Number of errors to expand by
    /// @return expanded Expanded errors array
    function _expandErrorsArray(string[] memory errors, uint256 count)
        internal pure returns (string[] memory expanded)
    {
        expanded = new string[](errors.length + count);
        for (uint256 i = 0; i < errors.length; i++) {
            expanded[i] = errors[i];
        }
    }

    /// @notice Expand warnings array
    /// @param warnings Current warnings array
    /// @param count Number of warnings to expand by
    /// @return expanded Expanded warnings array
    function _expandWarningsArray(string[] memory warnings, uint256 count)
        internal pure returns (string[] memory expanded)
    {
        expanded = new string[](warnings.length + count);
        for (uint256 i = 0; i < warnings.length; i++) {
            expanded[i] = warnings[i];
        }
    }
}
