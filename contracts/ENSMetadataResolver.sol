// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IENSMetadataResolver.sol";
import "./ENSMetadataTypes.sol";
import "./IMetadataRegistry.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/ResolverBase.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title ENS Contract Metadata Resolver
/// @notice Extended ENS resolver for contract metadata as per ENSIP-X
/// @dev Extends ENS ResolverBase with metadata-specific functionality
contract ENSMetadataResolver is ResolverBase, IENSMetadataResolver {
    using Strings for uint256;

    /// @notice Metadata registry contract
    IMetadataRegistry public metadataRegistry;

    /// @notice CCIP gateway for metadata retrieval
    address public ccipGateway;

    /// @notice ENS registry for node operations
    address public ensRegistry;

    /// @notice Mapping of ENS node to metadata hash
    mapping(bytes32 => bytes32) private _nodeToMetadataHash;

    /// @notice Mapping of ENS node to metadata
    mapping(bytes32 => string) private _nodeToMetadata;

    /// @notice Mapping of ENS node to interfaces
    mapping(bytes32 => ENSMetadataTypes.ContractInterface[]) private _nodeToInterfaces;

    /// @notice Mapping of ENS node to security info
    mapping(bytes32 => ENSMetadataTypes.Security) private _nodeToSecurity;

    /// @notice Mapping of ENS node to deployment info
    mapping(bytes32 => ENSMetadataTypes.Deployment) private _nodeToDeployment;

    /// @notice Mapping of ENS node to standards info
    mapping(bytes32 => ENSMetadataTypes.Standards) private _nodeToStandards;

    /// @notice Events
    event MetadataSet(bytes32 indexed node, bytes32 metadataHash);
    event MetadataHashSet(bytes32 indexed node, bytes32 metadataHash);
    event InterfacesSet(bytes32 indexed node);
    event SecuritySet(bytes32 indexed node);
    event DeploymentSet(bytes32 indexed node);
    event StandardsSet(bytes32 indexed node);

    /// @notice Constructor
    /// @param _ens ENS registry address
    /// @param _metadataRegistry Metadata registry address
    /// @param _ccipGateway CCIP gateway address
    constructor(
        address _ens,
        address _metadataRegistry,
        address _ccipGateway
    ) ResolverBase(_ens) {
        metadataRegistry = IMetadataRegistry(_metadataRegistry);
        ccipGateway = _ccipGateway;
        ensRegistry = _ens;
    }

    /// @inheritdoc IENSMetadataResolver
    function contractMetadata(bytes32 node)
        external view override
        returns (string memory metadata)
    {
        bytes32 metadataHash = _nodeToMetadataHash[node];
        if (metadataHash == bytes32(0)) {
            return "";
        }

        // Try local storage first
        string memory localMetadata = _nodeToMetadata[node];
        if (bytes(localMetadata).length > 0) {
            return localMetadata;
        }

        // Fetch from registry if available
        ENSMetadataTypes.MetadataRecord memory record = metadataRegistry.getMetadataRecord(metadataHash);
        if (record.active) {
            // In production, would fetch from CCIP gateway
            // For now, return placeholder
            return string(abi.encodePacked('{"hash":"', uint256(metadataHash), '"}'));
        }

        return "";
    }

    /// @inheritdoc IENSMetadataResolver
    function contractInterfaces(bytes32 node)
        external view override
        returns (ENSMetadataTypes.ContractInterface[] memory interfaces)
    {
        return _nodeToInterfaces[node];
    }

    /// @inheritdoc IENSMetadataResolver
    function contractSecurity(bytes32 node)
        external view override
        returns (ENSMetadataTypes.Security memory security)
    {
        return _nodeToSecurity[node];
    }

    /// @inheritdoc IENSMetadataResolver
    function contractDeployment(bytes32 node)
        external view override
        returns (ENSMetadataTypes.Deployment memory deployment)
    {
        return _nodeToDeployment[node];
    }

    /// @inheritdoc IENSMetadataResolver
    function contractStandards(bytes32 node)
        external view override
        returns (ENSMetadataTypes.Standards memory standards)
    {
        return _nodeToStandards[node];
    }

    /// @inheritdoc IENSMetadataResolver
    function contractId(bytes32 node)
        external view override
        returns (string memory id)
    {
        ENSMetadataTypes.ContractMetadata memory metadata = getContractMetadata(node);
        return metadata.id;
    }

    /// @inheritdoc IENSMetadataResolver
    function contractAddresses(bytes32 node)
        external view override
        returns (address[] memory addresses)
    {
        ENSMetadataTypes.ContractMetadata memory metadata = getContractMetadata(node);
        return metadata.addresses;
    }

    /// @inheritdoc IENSMetadataResolver
    function contractMetadataHash(bytes32 node)
        external view override
        returns (bytes32 metadataHash)
    {
        return _nodeToMetadataHash[node];
    }

    /// @inheritdoc IENSMetadataResolver
    function contractEnsRoot(bytes32 node)
        external view override
        returns (string memory ensRoot)
    {
        ENSMetadataTypes.ContractMetadata memory metadata = getContractMetadata(node);
        return metadata.ensRoot;
    }

    /// @inheritdoc IENSMetadataResolver
    function hasValidContractMetadata(bytes32 node)
        external view override
        returns (bool valid)
    {
        ENSMetadataTypes.ContractMetadata memory metadata = getContractMetadata(node);

        // Basic validation checks
        if (bytes(metadata.id).length == 0) return false;
        if (bytes(metadata.org).length == 0) return false;
        if (bytes(metadata.protocol).length == 0) return false;
        if (bytes(metadata.category).length == 0) return false;
        if (bytes(metadata.role).length == 0) return false;
        if (bytes(metadata.version).length == 0) return false;
        if (metadata.chainId == 0) return false;
        if (metadata.addresses.length == 0) return false;
        if (metadata.metadataHash == bytes32(0)) return false;

        return true;
    }

    /// @inheritdoc IENSMetadataResolver
    function getContractMetadata(bytes32 node)
        public view override
        returns (ENSMetadataTypes.ContractMetadata memory metadata)
    {
        // Try to reconstruct from stored components
        metadata.id = _extractFromMetadata(node, "id");
        metadata.org = _extractFromMetadata(node, "org");
        metadata.protocol = _extractFromMetadata(node, "protocol");
        metadata.category = _extractFromMetadata(node, "category");
        metadata.role = _extractFromMetadata(node, "role");
        metadata.version = _extractFromMetadata(node, "version");
        metadata.chainId = _extractUintFromMetadata(node, "chainId");
        metadata.addresses = _extractAddressesFromMetadata(node);
        metadata.metadataHash = _nodeToMetadataHash[node];
        metadata.ensRoot = _extractFromMetadata(node, "ensRoot");
        metadata.standards = _nodeToStandards[node];
        metadata.security = _nodeToSecurity[node];
        metadata.deployment = _nodeToDeployment[node];

        // Set subdomains if any
        metadata.subdomains = new bytes32[](0); // Simplified for this implementation
        metadata.dns.subdomains = new ENSMetadataTypes.SubdomainInfo[](0);
        metadata.dns.records = new ENSMetadataTypes.RecordInfo[](0);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractMetadata(bytes32 node, string calldata metadata) external override authorised(node) {
        // Parse and validate metadata
        ENSMetadataTypes.ContractMetadata memory parsedMetadata = _parseMetadata(metadata);

        // Store components
        _nodeToMetadata[node] = metadata;
        _nodeToMetadataHash[node] = parsedMetadata.metadataHash;

        // Extract and store individual components
        _setMetadataComponents(node, parsedMetadata);

        emit MetadataSet(node, parsedMetadata.metadataHash);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractMetadataHash(bytes32 node, bytes32 metadataHash) external override authorised(node) {
        _nodeToMetadataHash[node] = metadataHash;
        emit MetadataHashSet(node, metadataHash);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractInterfaces(
        bytes32 node,
        ENSMetadataTypes.ContractInterface[] calldata interfaces
    ) external override authorised(node) {
        _nodeToInterfaces[node] = interfaces;
        emit InterfacesSet(node);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractSecurity(
        bytes32 node,
        ENSMetadataTypes.Security calldata security
    ) external override authorised(node) {
        _nodeToSecurity[node] = security;
        emit SecuritySet(node);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractDeployment(
        bytes32 node,
        ENSMetadataTypes.Deployment calldata deployment
    ) external override authorised(node) {
        _nodeToDeployment[node] = deployment;
        emit DeploymentSet(node);
    }

    /// @inheritdoc IENSMetadataResolver
    function setContractStandards(
        bytes32 node,
        ENSMetadataTypes.Standards calldata standards
    ) external override authorised(node) {
        _nodeToStandards[node] = standards;
        emit StandardsSet(node);
    }

    /// @inheritdoc IENSMetadataResolver
    function getContractDependencies(bytes32 node)
        external view override
        returns (ENSMetadataTypes.DependencyInfo memory dependencies)
    {
        ENSMetadataTypes.Standards memory standards = _nodeToStandards[node];
        return standards.dependencies;
    }

    /// @inheritdoc IENSMetadataResolver
    function getContractDependents(bytes32 node)
        external view override
        returns (string[] memory dependents)
    {
        // In a full implementation, this would query a dependency graph
        // For now, return empty array as dependency relationships are not tracked
        return new string[](0);
    }

    /// @inheritdoc IENSMetadataResolver
    function verifyDependencyChain(bytes32[] calldata dependencyChain)
        external view override
        returns (ENSMetadataTypes.DependencyResolution memory resolution)
    {
        resolution.compatible = true;
        resolution.issues = new string[](0);

        // Basic compatibility check - ensure all nodes have metadata
        for (uint256 i = 0; i < dependencyChain.length; i++) {
            bytes32 node = dependencyChain[i];
            if (_nodeToMetadataHash[node] == bytes32(0)) {
                resolution.compatible = false;
                resolution.issues = new string[](1);
                resolution.issues[0] = string(abi.encodePacked(
                    "Missing metadata for contract: ",
                    uint256(node).toHexString()
                ));
                return resolution;
            }
        }

        // In a full implementation, would check version compatibility,
        // interface compatibility, and security implications
        return resolution;
    }

    /// @inheritdoc IENSMetadataResolver
    function getDependencyGraph(bytes32 node, uint256 depth)
        external view override
        returns (ENSMetadataTypes.DependencyNode[] memory graph)
    {
        // Simplified implementation - in production would build full graph
        ENSMetadataTypes.DependencyNode[] memory nodes = new ENSMetadataTypes.DependencyNode[](1);

        ENSMetadataTypes.Standards memory standards = _nodeToStandards[node];
        ENSMetadataTypes.DependencyInfo memory deps = standards.dependencies;

        nodes[0] = ENSMetadataTypes.DependencyNode({
            domain: nodeToDomain(node),
            contractType: "implementation",
            dependencies: new ENSMetadataTypes.DependencyEdge[](0),
            dependents: new ENSMetadataTypes.DependencyEdge[](0)
        });

        return nodes;
    }

    /// @inheritdoc IENSMetadataResolver
    function registerDependency(
        string calldata dependentDomain,
        string calldata dependencyDomain,
        string calldata relationship
    ) external override authorised(namehash(dependentDomain)) {
        // In a full implementation, would update dependency mappings
        // For now, this is a placeholder that ensures authorization
        require(bytes(relationship).length > 0, "ENSMetadataResolver: empty relationship");
    }

    /// @notice Convert ENS node hash to domain string (simplified)
    /// @param node ENS node hash
    /// @return domain Domain string representation
    function nodeToDomain(bytes32 node) internal pure returns (string memory domain) {
        // Simplified - in production would implement proper ENS name resolution
        return string(abi.encodePacked(uint256(node).toHexString(), ".cns.eth"));
    }

    /// @inheritdoc IENSMetadataResolver
    function validateContractMetadata(bytes32 node)
        external view override
        returns (ENSMetadataTypes.ValidationResult memory validationResult)
    {
        ENSMetadataTypes.ContractMetadata memory metadata = getContractMetadata(node);

        // Basic validation
        validationResult.validatedAt = block.timestamp;
        validationResult.validator = address(this);

        if (bytes(metadata.id).length == 0) {
            validationResult.valid = false;
            validationResult.errors = new string[](1);
            validationResult.errors[0] = "Missing contract ID";
            return validationResult;
        }

        if (metadata.addresses.length == 0) {
            validationResult.valid = false;
            validationResult.errors = new string[](1);
            validationResult.errors[0] = "No contract addresses specified";
            return validationResult;
        }

        // Check if all addresses are valid
        for (uint256 i = 0; i < metadata.addresses.length; i++) {
            if (metadata.addresses[i] == address(0)) {
                validationResult.valid = false;
                validationResult.errors = new string[](1);
                validationResult.errors[0] = "Invalid contract address (zero address)";
                return validationResult;
            }
        }

        validationResult.valid = true;
        validationResult.warnings = new string[](0);
    }

    /// @inheritdoc IENSMetadataResolver
    function getMetadataVersion(bytes32 node)
        external view override
        returns (string memory version)
    {
        return "1.0.0"; // ENSIP-X version
    }

    /// @inheritdoc IENSMetadataResolver
    function supportsInterface(bytes4 interfaceID)
        external pure override
        returns (bool supported)
    {
        return interfaceID == type(IENSMetadataResolver).interfaceId ||
               interfaceID == type(IResolver).interfaceId;
    }

    /// @notice Parse metadata JSON string into struct
    /// @param metadata JSON metadata string
    /// @return parsed Parsed metadata struct
    function _parseMetadata(string memory metadata)
        internal pure returns (ENSMetadataTypes.ContractMetadata memory parsed)
    {
        // Simplified JSON parsing - in production would use proper JSON library
        // For now, return empty struct with hash derived from metadata
        parsed.metadataHash = keccak256(abi.encodePacked(metadata));
        parsed.id = _extractFromJson(metadata, "id");
        parsed.org = _extractFromJson(metadata, "org");
        parsed.protocol = _extractFromJson(metadata, "protocol");
        parsed.category = _extractFromJson(metadata, "category");
        parsed.role = _extractFromJson(metadata, "role");
        parsed.version = _extractFromJson(metadata, "version");
        parsed.ensRoot = _extractFromJson(metadata, "ensRoot");

        // Parse chain ID
        string memory chainIdStr = _extractFromJson(metadata, "chainId");
        if (bytes(chainIdStr).length > 0) {
            parsed.chainId = _parseUint(chainIdStr);
        }
    }

    /// @notice Set individual metadata components
    /// @param node ENS node hash
    /// @param metadata Parsed metadata struct
    function _setMetadataComponents(bytes32 node, ENSMetadataTypes.ContractMetadata memory metadata) internal {
        // Components are already stored in their respective mappings
        // This function can be extended for additional processing
    }

    /// @notice Extract string value from metadata JSON
    /// @param metadata JSON metadata string
    /// @param key Key to extract
    /// @return value Extracted value
    function _extractFromMetadata(bytes32 node, string memory key)
        internal view returns (string memory value)
    {
        string memory metadata = _nodeToMetadata[node];
        return _extractFromJson(metadata, key);
    }

    /// @notice Extract uint value from metadata JSON
    /// @param node ENS node hash
    /// @param key Key to extract
    /// @return value Extracted value
    function _extractUintFromMetadata(bytes32 node, string memory key)
        internal view returns (uint256 value)
    {
        string memory strValue = _extractFromMetadata(node, key);
        return _parseUint(strValue);
    }

    /// @notice Extract addresses from metadata JSON
    /// @param node ENS node hash
    /// @return addresses Array of addresses
    function _extractAddressesFromMetadata(bytes32 node)
        internal view returns (address[] memory addresses)
    {
        // Simplified implementation - in production would parse JSON array
        return new address[](0);
    }

    /// @notice Simple JSON extraction (simplified implementation)
    /// @param json JSON string
    /// @param key Key to extract
    /// @return value Extracted value
    function _extractFromJson(string memory json, string memory key)
        internal pure returns (string memory value)
    {
        // This is a very simplified JSON parser
        // In production, would use a proper JSON library like OpenZeppelin's
        string memory searchKey = string(abi.encodePacked('"', key, '":'));
        bytes memory jsonBytes = bytes(json);
        bytes memory keyBytes = bytes(searchKey);

        for (uint256 i = 0; i < jsonBytes.length - keyBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < keyBytes.length; j++) {
                if (jsonBytes[i + j] != keyBytes[j]) {
                    found = false;
                    break;
                }
            }

            if (found) {
                // Skip to value start
                i += keyBytes.length;
                while (i < jsonBytes.length && (jsonBytes[i] == ' ' || jsonBytes[i] == ':' || jsonBytes[i] == '"')) {
                    i++;
                }

                // Extract value until next comma or closing brace
                uint256 start = i;
                uint256 end = i;

                if (jsonBytes[i] == '"') {
                    // String value
                    i++; // Skip opening quote
                    start = i;
                    while (i < jsonBytes.length && jsonBytes[i] != '"') {
                        i++;
                    }
                    end = i;
                } else {
                    // Numeric or other value
                    while (i < jsonBytes.length && jsonBytes[i] != ',' && jsonBytes[i] != '}') {
                        i++;
                    }
                    end = i;
                }

                return string(abi.encodePacked(jsonBytes[start:end]));
            }
        }

        return "";
    }

    /// @notice Parse string to uint256
    /// @param value String representation of number
    /// @return parsed Parsed uint256 value
    function _parseUint(string memory value) internal pure returns (uint256 parsed) {
        bytes memory b = bytes(value);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x30 && b[i] <= 0x39) {
                result = result * 10 + (uint256(uint8(b[i])) - 48);
            }
        }
        return result;
    }

    /// @notice Set metadata registry address
    /// @param _metadataRegistry New metadata registry address
    function setMetadataRegistry(address _metadataRegistry) external onlyOwner {
        require(_metadataRegistry != address(0), "ENSMetadataResolver: invalid registry address");
        metadataRegistry = IMetadataRegistry(_metadataRegistry);
    }

    /// @notice Set CCIP gateway address
    /// @param _ccipGateway New CCIP gateway address
    function setCCIPGateway(address _ccipGateway) external onlyOwner {
        require(_ccipGateway != address(0), "ENSMetadataResolver: invalid gateway address");
        ccipGateway = _ccipGateway;
    }
}
