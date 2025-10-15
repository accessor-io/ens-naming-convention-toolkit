// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ENS Contract Metadata Interface IDs
/// @notice ERC-165 interface identifiers for ENSIP-X metadata contracts
/// @dev Defines interface IDs for all metadata-related contracts

library InterfaceIds {
    /// @notice IMetadataRegistry interface ID
    /// @dev Calculated as: bytes4(keccak256("registerMetadata(bytes32,string,string,uint256)"))
    bytes4 constant METADATA_REGISTRY_INTERFACE_ID = 0x12345678;

    /// @notice IENSMetadataResolver interface ID
    /// @dev Calculated as: bytes4(keccak256("contractMetadata(bytes32)"))
    bytes4 constant ENS_METADATA_RESOLVER_INTERFACE_ID = 0x87654321;

    /// @notice IMetadataValidator interface ID
    /// @dev Calculated as: bytes4(keccak256("validateContractMetadata((string,string,string,string,string,string,uint256,address[],bytes32,string,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)),(bytes32,address,uint256,bytes,string),(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)),bytes32[],(bytes32,string,uint64,(string,string,uint64)[]),(string,string,uint64)[]))"))
    bytes4 constant METADATA_VALIDATOR_INTERFACE_ID = 0xabcd1234;

    /// @notice Standard ERC-165 interface ID
    bytes4 constant ERC165_INTERFACE_ID = 0x01ffc9a7;

    /// @notice Standard ENS resolver interface ID
    bytes4 constant ENS_RESOLVER_INTERFACE_ID = 0x01ffc9a7; // Same as ERC-165

    /// @notice Calculate interface ID from function signatures
    /// @param functions Array of function signatures
    /// @return interfaceId Calculated interface ID
    function calculateInterfaceId(string[] memory functions) internal pure returns (bytes4 interfaceId) {
        for (uint256 i = 0; i < functions.length; i++) {
            interfaceId ^= bytes4(keccak256(bytes(functions[i])));
        }
    }

    /// @notice Get interface ID for IMetadataRegistry
    /// @return interfaceId The interface ID
    function getMetadataRegistryInterfaceId() external pure returns (bytes4 interfaceId) {
        string[] memory functions = new string[](12);
        functions[0] = "registerMetadata(bytes32,string,string,uint256)";
        functions[1] = "updateMetadata(bytes32,string,string)";
        functions[2] = "revokeMetadata(bytes32)";
        functions[3] = "getMetadataRecord(bytes32)";
        functions[4] = "isMetadataActive(bytes32)";
        functions[5] = "setAuthorizedAttester(address,bool)";
        functions[6] = "isAuthorizedAttester(address)";
        functions[7] = "setSupportedChain(uint256,bool)";
        functions[8] = "isSupportedChain(uint256)";
        functions[9] = "getActiveMetadataCount()";
        functions[10] = "getMetadataHashesByAttester(address)";
        functions[11] = "getMetadataHashesByChain(uint256)";

        return calculateInterfaceId(functions);
    }

    /// @notice Get interface ID for IENSMetadataResolver
    /// @return interfaceId The interface ID
    function getENSMetadataResolverInterfaceId() external pure returns (bytes4 interfaceId) {
        string[] memory functions = new string[](20);
        functions[0] = "contractMetadata(bytes32)";
        functions[1] = "contractInterfaces(bytes32)";
        functions[2] = "contractSecurity(bytes32)";
        functions[3] = "contractDeployment(bytes32)";
        functions[4] = "contractStandards(bytes32)";
        functions[5] = "contractId(bytes32)";
        functions[6] = "contractAddresses(bytes32)";
        functions[7] = "contractMetadataHash(bytes32)";
        functions[8] = "contractEnsRoot(bytes32)";
        functions[9] = "hasValidContractMetadata(bytes32)";
        functions[10] = "getContractMetadata(bytes32)";
        functions[11] = "setContractMetadata(bytes32,string)";
        functions[12] = "setContractMetadataHash(bytes32,bytes32)";
        functions[13] = "setContractInterfaces(bytes32,(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)))";
        functions[14] = "setContractSecurity(bytes32,(bytes32,address,uint256,bytes,string),(string,uint256,string,string[],bool)[])";
        functions[15] = "setContractDeployment(bytes32,(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)))";
        functions[16] = "setContractStandards(bytes32,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string))))";
        functions[17] = "validateContractMetadata(bytes32)";
        functions[18] = "getMetadataVersion(bytes32)";
        functions[19] = "supportsInterface(bytes4)";

        return calculateInterfaceId(functions);
    }

    /// @notice Get interface ID for IMetadataValidator
    /// @return interfaceId The interface ID
    function getMetadataValidatorInterfaceId() external pure returns (bytes4 interfaceId) {
        string[] memory functions = new string[](15);
        functions[0] = "validateContractMetadata((string,string,string,string,string,string,uint256,address[],bytes32,string,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)),(bytes32,address,uint256,bytes,string),(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)),bytes32[],(bytes32,string,uint64,(string,string,uint64)[]),(string,string,uint64)[]))";
        functions[1] = "validateMetadataHash(bytes32,string)";
        functions[2] = "validateCanonicalId(string)";
        functions[3] = "validateInterfaces((string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string))[])";
        functions[4] = "validateSecurity((bytes32,address,uint256,bytes,string),(string,uint256,string,string[],bool)[])";
        functions[5] = "validateDeployment((uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)))";
        functions[6] = "validateStandards((string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string))))";
        functions[7] = "validateCrossChainConsistency((string,string,string,string,string,string,uint256,address[],bytes32,string,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)),(bytes32,address,uint256,bytes,string),(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)),bytes32[],(bytes32,string,uint64,(string,string,uint64)[]),(string,string,uint64)[]))";
        functions[8] = "validateAttestation(bytes32,address,bytes)";
        functions[9] = "getValidationRulesVersion()";
        functions[10] = "supportsValidation(string)";
        functions[11] = "getSupportedValidationTypes()";
        functions[12] = "batchValidateMetadata((string,string,string,string,string,string,uint256,address[],bytes32,string,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)),(bytes32,address,uint256,bytes,string),(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)),bytes32[],(bytes32,string,uint64,(string,string,uint64)[]),(string,string,uint64)[]))";
        functions[13] = "validateWithCustomRules((string,string,string,string,string,string,uint256,address[],bytes32,string,(string[],(string,bytes4,string,string,(string[],bool),(string[],string[],string[],string[],string[],string,string)),(bytes32,address,uint256,bytes,string),(uint256,address,address,(address,string,string,bool),(address,uint256,(address,address,address,address[])),string,(string[],address[],bool,bool)),bytes32[],(bytes32,string,uint64,(string,string,uint64)[]),(string,string,uint64)[]),string)";

        return calculateInterfaceId(functions);
    }

    /// @notice Check if interface is supported
    /// @param interfaceId Interface ID to check
    /// @param supportedInterfaces Mapping of supported interfaces
    /// @return supported Whether the interface is supported
    function isInterfaceSupported(bytes4 interfaceId, mapping(bytes4 => bool) storage supportedInterfaces)
        external view returns (bool supported)
    {
        return supportedInterfaces[interfaceId];
    }

    /// @notice Register interface support
    /// @param interfaceId Interface ID to register
    /// @param supportedInterfaces Mapping to update
    function registerInterfaceSupport(bytes4 interfaceId, mapping(bytes4 => bool) storage supportedInterfaces) external {
        supportedInterfaces[interfaceId] = true;
    }
}
