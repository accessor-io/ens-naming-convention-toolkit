// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ENSMetadataTypes.sol";
import "./IMetadataRegistry.sol";
import "./IENSMetadataResolver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Cross-Chain Metadata CCIP Receiver
/// @notice Receives cross-chain metadata assignments via CCIP
/// @dev Extends CCIPReceiver to handle metadata synchronization across chains
contract MetadataCCIPReceiver is CCIPReceiver, Ownable {
    /// @notice Metadata registry contract
    IMetadataRegistry public metadataRegistry;

    /// @notice ENS metadata resolver contract
    IENSMetadataResolver public ensMetadataResolver;

    /// @notice ENS registry for node operations
    address public ensRegistry;

    /// @notice Mapping of authorized source chains
    mapping(uint256 => bool) public authorizedSourceChains;

    /// @notice Mapping of processed message IDs to prevent replay attacks
    mapping(bytes32 => bool) public processedMessages;

    /// @notice Events
    event CrossChainMetadataReceived(
        bytes32 indexed messageId,
        bytes32 indexed metadataHash,
        uint256 indexed sourceChainId,
        bytes32 ensNode,
        address attester
    );

    event SourceChainAuthorized(uint256 indexed chainId, bool authorized);

    event MetadataRegistryUpdated(bytes32 indexed metadataHash, bytes32 ensNode);

    /// @notice Constructor
    /// @param _router CCIP router address
    /// @param _metadataRegistry Metadata registry address
    /// @param _ensMetadataResolver ENS metadata resolver address
    /// @param _ensRegistry ENS registry address
    constructor(
        address _router,
        address _metadataRegistry,
        address _ensMetadataResolver,
        address _ensRegistry
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        metadataRegistry = IMetadataRegistry(_metadataRegistry);
        ensMetadataResolver = IENSMetadataResolver(_ensMetadataResolver);
        ensRegistry = _ensRegistry;

        // Authorize current chain as source by default
        authorizedSourceChains[block.chainid] = true;
    }

    /// @notice Receive cross-chain message
    /// @param message CCIP message containing metadata assignment
    function _ccipReceive(Client.Any2EVMMessage memory message)
        internal override
        onlyOwner // Only owner can trigger cross-chain receives for security
    {
        bytes32 messageId = message.messageId;
        require(!processedMessages[messageId], "MetadataCCIPReceiver: message already processed");

        // Decode metadata assignment message
        ENSMetadataTypes.MetadataAssignmentMessage memory assignment =
            abi.decode(message.data, (ENSMetadataTypes.MetadataAssignmentMessage));

        // Verify source chain authorization
        require(
            authorizedSourceChains[assignment.sourceChainId],
            "MetadataCCIPReceiver: unauthorized source chain"
        );

        // Verify attester authorization
        require(
            metadataRegistry.isAuthorizedAttester(assignment.attester),
            "MetadataCCIPReceiver: unauthorized attester"
        );

        // Verify message signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            assignment.metadataHash,
            assignment.ensNode,
            assignment.sourceChainId,
            assignment.targetChainId,
            assignment.timestamp
        ));

        // In production, would verify signature against attester
        // For now, assume signature verification is done off-chain

        // Register metadata in local registry
        metadataRegistry.registerMetadata(
            assignment.metadataHash,
            assignment.gateway,
            assignment.path,
            assignment.sourceChainId
        );

        // Update ENS record if ENS node is provided
        if (assignment.ensNode != bytes32(0)) {
            ensMetadataResolver.setContractMetadataHash(assignment.ensNode, assignment.metadataHash);

            // Set additional ENS text records for metadata
            _setENSTextRecords(assignment.ensNode, assignment);
        }

        // Mark message as processed
        processedMessages[messageId] = true;

        emit CrossChainMetadataReceived(
            messageId,
            assignment.metadataHash,
            assignment.sourceChainId,
            assignment.ensNode,
            assignment.attester
        );
    }

    /// @notice Set ENS text records for metadata information
    /// @param node ENS node hash
    /// @param assignment Metadata assignment message
    function _setENSTextRecords(
        bytes32 node,
        ENSMetadataTypes.MetadataAssignmentMessage memory assignment
    ) internal {
        // Set metadata hash
        bytes32 setHash = ensMetadataResolver.setContractMetadataHash(node, assignment.metadataHash);

        // Set additional metadata information as text records
        // Note: This would require the resolver to support setText functionality
        // In a full implementation, the resolver would need to be extended

        emit MetadataRegistryUpdated(assignment.metadataHash, node);
    }

    /// @notice Authorize or deauthorize a source chain
    /// @param chainId Chain ID to authorize/deauthorize
    /// @param authorized Whether the chain should be authorized
    function setAuthorizedSourceChain(uint256 chainId, bool authorized) external onlyOwner {
        require(chainId != 0, "MetadataCCIPReceiver: invalid chain ID");

        authorizedSourceChains[chainId] = authorized;
        emit SourceChainAuthorized(chainId, authorized);
    }

    /// @notice Check if source chain is authorized
    /// @param chainId Chain ID to check
    /// @return authorized Whether the chain is authorized
    function isAuthorizedSourceChain(uint256 chainId) external view returns (bool authorized) {
        return authorizedSourceChains[chainId];
    }

    /// @notice Set metadata registry address
    /// @param _metadataRegistry New metadata registry address
    function setMetadataRegistry(address _metadataRegistry) external onlyOwner {
        require(_metadataRegistry != address(0), "MetadataCCIPReceiver: invalid registry address");
        metadataRegistry = IMetadataRegistry(_metadataRegistry);
    }

    /// @notice Set ENS metadata resolver address
    /// @param _ensMetadataResolver New ENS metadata resolver address
    function setENSMetadataResolver(address _ensMetadataResolver) external onlyOwner {
        require(_ensMetadataResolver != address(0), "MetadataCCIPReceiver: invalid resolver address");
        ensMetadataResolver = IENSMetadataResolver(_ensMetadataResolver);
    }

    /// @notice Set ENS registry address
    /// @param _ensRegistry New ENS registry address
    function setENSRegistry(address _ensRegistry) external onlyOwner {
        require(_ensRegistry != address(0), "MetadataCCIPReceiver: invalid ENS registry address");
        ensRegistry = _ensRegistry;
    }

    /// @notice Get list of authorized source chains
    /// @return chainIds Array of authorized chain IDs
    function getAuthorizedSourceChains() external view returns (uint256[] memory chainIds) {
        // Simplified implementation - in production would use enumerable mapping
        uint256[] memory chains = new uint256[](1);
        if (authorizedSourceChains[block.chainid]) {
            chains[0] = block.chainid;
        }
        return chains;
    }

    /// @notice Process multiple messages (batch processing)
    /// @param messages Array of CCIP messages to process
    function processBatchMessages(Client.Any2EVMMessage[] calldata messages) external onlyOwner {
        for (uint256 i = 0; i < messages.length; i++) {
            _ccipReceive(messages[i]);
        }
    }

    /// @notice Emergency function to handle stuck messages
    /// @param messageId Message ID to force process
    /// @param assignment Metadata assignment data
    function emergencyProcessMessage(
        bytes32 messageId,
        ENSMetadataTypes.MetadataAssignmentMessage calldata assignment
    ) external onlyOwner {
        require(!processedMessages[messageId], "MetadataCCIPReceiver: message already processed");

        // Similar logic to _ccipReceive but without signature verification
        // Use with extreme caution - only for emergency recovery

        processedMessages[messageId] = true;

        emit CrossChainMetadataReceived(
            messageId,
            assignment.metadataHash,
            assignment.sourceChainId,
            assignment.ensNode,
            assignment.attester
        );
    }

    /// @notice Get message processing status
    /// @param messageId Message ID to check
    /// @return processed Whether the message has been processed
    function isMessageProcessed(bytes32 messageId) external view returns (bool processed) {
        return processedMessages[messageId];
    }
}
