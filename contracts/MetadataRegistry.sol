// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IMetadataRegistry.sol";
import "./ENSMetadataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ENS Contract Metadata Registry
/// @notice Core contract for registering and managing ENS contract metadata
/// @dev Implements ENSIP-X metadata standard with cross-chain support and fee collection
contract MetadataRegistry is IMetadataRegistry, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    /// @notice Fee structure for different service tiers
    struct FeeTier {
        uint256 baseRate;           // Base fee in USD (scaled by 1e18)
        uint256 monthlyCap;         // Monthly spending cap
        uint256 discountRate;       // Volume discount percentage (0-100)
        bool enabled;               // Whether this tier is active
    }

    /// @notice User registration statistics for usage tracking
    struct UserStats {
        uint256 totalRegistrations;  // Lifetime registration count
        uint256 totalDataSize;       // Total calldata size processed
        uint256 totalPaid;           // Total fees paid by user
        uint256 firstRegistration;   // Timestamp of first registration
    }

    /// @notice Mapping of metadata hash to metadata record
    mapping(bytes32 => ENSMetadataTypes.MetadataRecord) public records;

    /// @notice Mapping of authorized attesters
    mapping(address => bool) public authorizedAttesters;

    /// @notice Mapping of supported chains for cross-chain operations
    mapping(uint256 => bool) public supportedChains;

    /// @notice Counter for total records created
    uint256 public totalRecords;

    /// @notice Counter for active records
    uint256 public activeRecords;

    /// @notice Mapping to track metadata hashes by attester
    mapping(address => bytes32[]) private _metadataHashesByAttester;

    /// @notice Mapping to track metadata hashes by chain
    mapping(uint256 => bytes32[]) private _metadataHashesByChain;

    /// @notice Mapping to track used attestation signatures to prevent replay attacks
    mapping(bytes32 => bool) private _usedAttestations;

    /// @notice CCIP router address for cross-chain messaging
    address public ccipRouter;

    /// @notice ENS registry address for integration
    address public ensRegistry;

    /// @notice Metadata validator contract
    address public metadataValidator;

    /// @notice Fee management
    mapping(address => FeeTier) public userTiers;           // User fee tiers
    mapping(address => UserStats) public userStats;         // User registration statistics
    mapping(address => bool) public exemptedUsers;          // Fee-exempted users
    mapping(string => bool) public exemptedCategories;      // Fee-exempted categories

    /// @notice Current gas price for dynamic fee adjustment
    uint256 public currentGasPrice;

    /// @notice ETH price in USD for fee calculation (scaled by 1e18)
    uint256 public ethPriceUSD;

    /// @notice Total fees collected
    uint256 public totalFeesCollected;

    /// @notice Fee beneficiaries and their shares (percentages sum to 100)
    address[] public feeBeneficiaries;
    uint256[] public beneficiaryShares;

    /// @notice Default fee tier for new users
    FeeTier public defaultFeeTier;

    /// @notice Events
    event MetadataRegistered(
        bytes32 indexed metadataHash,
        address indexed attester,
        string gateway,
        string path,
        uint256 chainId
    );

    event MetadataUpdated(
        bytes32 indexed metadataHash,
        address indexed attester,
        string gateway,
        string path
    );

    event MetadataRevoked(bytes32 indexed metadataHash, address indexed attester);

    event AttesterAuthorized(address indexed attester, bool authorized);

    event ChainSupported(uint256 indexed chainId, bool supported);

    event CrossChainMetadataAssigned(
        bytes32 indexed metadataHash,
        uint256 indexed targetChainId,
        bytes32 ensNode
    );

    event AttestationVerified(
        bytes32 indexed metadataHash,
        address indexed attester,
        bool valid
    );

    /// @notice Fee-related events
    event FeePaid(address indexed user, uint256 amount, bytes32 metadataHash);
    event FeeTierUpdated(address indexed user, uint256 baseRate, uint256 monthlyCap);
    event UserExempted(address indexed user, bool exempted);
    event CategoryExempted(string category, bool exempted);
    event FeeDistributed(uint256 totalAmount, address[] beneficiaries, uint256[] amounts);
    event GasPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event ETHPriceUpdated(uint256 oldPrice, uint256 newPrice);

    /// @notice Constructor
    /// @param _ccipRouter CCIP router address
    /// @param _ensRegistry ENS registry address
    /// @param _metadataValidator Metadata validator address
    constructor(
        address _ccipRouter,
        address _ensRegistry,
        address _metadataValidator
    ) Ownable(msg.sender) {
        ccipRouter = _ccipRouter;
        ensRegistry = _ensRegistry;
        metadataValidator = _metadataValidator;

        // Initialize fee system
        _initializeFeeSystem();

        // Authorize owner as initial attester
        authorizedAttesters[msg.sender] = true;

        // Support Ethereum mainnet by default
        supportedChains[1] = true;

        emit AttesterAuthorized(msg.sender, true);
        emit ChainSupported(1, true);
    }

    /// @notice Initialize fee system with default parameters
    function _initializeFeeSystem() internal {
        // Set default fee tier ($0.025 per KB base rate)
        defaultFeeTier = FeeTier({
            baseRate: 25 * 1e15,    // $0.025 per KB (scaled by 1e18)
            monthlyCap: 0,          // No monthly cap
            discountRate: 0,        // No discounts for simplicity
            enabled: true
        });

        // Set initial gas price (30 gwei)
        currentGasPrice = 30 gwei;

        // Set initial ETH price ($2000 USD)
        ethPriceUSD = 2000 * 1e18;

        // Initialize fee beneficiaries (owner gets 100% initially)
        feeBeneficiaries.push(owner());
        beneficiaryShares.push(100); // 100% to owner initially

        // Exempt public goods categories
        exemptedCategories["defi"] = true;
        exemptedCategories["dao"] = true;
        exemptedCategories["infra"] = true;
        exemptedCategories["security"] = true;

        emit CategoryExempted("defi", true);
        emit CategoryExempted("dao", true);
        emit CategoryExempted("infra", true);
        emit CategoryExempted("security", true);
    }

    /// @inheritdoc IMetadataRegistry
    function registerMetadata(
        bytes32 metadataHash,
        string calldata gateway,
        string calldata path,
        uint256 chainId
    ) external payable override nonReentrant {
        require(authorizedAttesters[msg.sender], "MetadataRegistry: unauthorized attester");
        require(metadataHash != bytes32(0), "MetadataRegistry: invalid metadata hash");
        require(bytes(gateway).length > 0, "MetadataRegistry: empty gateway");
        require(bytes(path).length > 0, "MetadataRegistry: empty path");
        require(supportedChains[chainId] || chainId == block.chainid, "MetadataRegistry: unsupported chain");

        // Calculate and collect fee based on calldata size
        uint256 fee = calculateFee(msg.sender, gateway, path, "");
        require(msg.value >= fee, "MetadataRegistry: insufficient fee payment");

        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        // Update user statistics
        _updateUserStats(msg.sender, fee, bytes(gateway).length + bytes(path).length);

        // Distribute collected fees
        if (fee > 0) {
            _distributeFees(fee);
        }

        ENSMetadataTypes.MetadataRecord storage record = records[metadataHash];

        if (record.timestamp == 0) {
            // New record
            record.metadataHash = metadataHash;
            record.gateway = gateway;
            record.path = path;
            record.timestamp = block.timestamp;
            record.attester = msg.sender;
            record.active = true;
            record.chainId = chainId;

            totalRecords++;
            activeRecords++;

            // Track by attester and chain
            _metadataHashesByAttester[msg.sender].push(metadataHash);
            _metadataHashesByChain[chainId].push(metadataHash);

            emit MetadataRegistered(metadataHash, msg.sender, gateway, path, chainId);
            emit FeePaid(msg.sender, fee, metadataHash);
        } else {
            // Update existing record
            require(record.active, "MetadataRegistry: record not active");
            require(record.attester == msg.sender, "MetadataRegistry: not record attester");

            record.gateway = gateway;
            record.path = path;
            record.timestamp = block.timestamp;

            emit MetadataUpdated(metadataHash, msg.sender, gateway, path);
        }
    }

    /// @inheritdoc IMetadataRegistry
    function updateMetadata(
        bytes32 metadataHash,
        string calldata gateway,
        string calldata path
    ) external override {
        require(authorizedAttesters[msg.sender], "MetadataRegistry: unauthorized attester");
        require(metadataHash != bytes32(0), "MetadataRegistry: invalid metadata hash");
        require(bytes(gateway).length > 0, "MetadataRegistry: empty gateway");
        require(bytes(path).length > 0, "MetadataRegistry: empty path");

        ENSMetadataTypes.MetadataRecord storage record = records[metadataHash];
        require(record.timestamp != 0, "MetadataRegistry: record does not exist");
        require(record.active, "MetadataRegistry: record not active");
        require(record.attester == msg.sender, "MetadataRegistry: not record attester");

        record.gateway = gateway;
        record.path = path;
        record.timestamp = block.timestamp;

        emit MetadataUpdated(metadataHash, msg.sender, gateway, path);
    }

    /// @inheritdoc IMetadataRegistry
    function revokeMetadata(bytes32 metadataHash) external override {
        ENSMetadataTypes.MetadataRecord storage record = records[metadataHash];
        require(record.timestamp != 0, "MetadataRegistry: record does not exist");
        require(
            record.attester == msg.sender || owner() == msg.sender,
            "MetadataRegistry: not authorized to revoke"
        );

        record.active = false;
        activeRecords--;

        emit MetadataRevoked(metadataHash, msg.sender);
    }

    /// @inheritdoc IMetadataRegistry
    function getMetadataRecord(bytes32 metadataHash)
        external view override
        returns (ENSMetadataTypes.MetadataRecord memory record)
    {
        return records[metadataHash];
    }

    /// @inheritdoc IMetadataRegistry
    function isMetadataActive(bytes32 metadataHash) external view override returns (bool active) {
        return records[metadataHash].active;
    }

    /// @inheritdoc IMetadataRegistry
    function setAuthorizedAttester(address attester, bool authorized) external override onlyOwner {
        require(attester != address(0), "MetadataRegistry: invalid attester address");

        authorizedAttesters[attester] = authorized;
        emit AttesterAuthorized(attester, authorized);
    }

    /// @inheritdoc IMetadataRegistry
    function isAuthorizedAttester(address attester) external view override returns (bool authorized) {
        return authorizedAttesters[attester];
    }

    /// @inheritdoc IMetadataRegistry
    function setSupportedChain(uint256 chainId, bool supported) external override onlyOwner {
        require(chainId != 0, "MetadataRegistry: invalid chain ID");

        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }

    /// @inheritdoc IMetadataRegistry
    function isSupportedChain(uint256 chainId) external view override returns (bool supported) {
        return supportedChains[chainId];
    }

    /// @inheritdoc IMetadataRegistry
    function getActiveMetadataCount() external view override returns (uint256 count) {
        return activeRecords;
    }

    /// @inheritdoc IMetadataRegistry
    function getMetadataHashesByAttester(address attester)
        external view override
        returns (bytes32[] memory hashes)
    {
        return _metadataHashesByAttester[attester];
    }

    /// @inheritdoc IMetadataRegistry
    function getMetadataHashesByChain(uint256 chainId)
        external view override
        returns (bytes32[] memory hashes)
    {
        return _metadataHashesByChain[chainId];
    }

    /// @inheritdoc IMetadataRegistry
    function assignCrossChainMetadata(
        uint256 targetChainId,
        ENSMetadataTypes.MetadataAssignmentMessage calldata message
    ) external override nonReentrant {
        require(authorizedAttesters[msg.sender], "MetadataRegistry: unauthorized attester");
        require(supportedChains[targetChainId], "MetadataRegistry: target chain not supported");
        require(targetChainId != block.chainid, "MetadataRegistry: cannot assign to same chain");
        require(message.metadataHash != bytes32(0), "MetadataRegistry: invalid metadata hash");
        require(message.ensNode != bytes32(0), "MetadataRegistry: invalid ENS node");
        require(message.targetChainId == targetChainId, "MetadataRegistry: chain ID mismatch");

        // Verify attestation signature
        bytes32 attestationHash = keccak256(abi.encodePacked(
            message.metadataHash,
            message.ensNode,
            message.sourceChainId,
            message.targetChainId,
            message.timestamp
        ));

        require(!_usedAttestations[attestationHash], "MetadataRegistry: attestation already used");

        bytes32 messageHash = keccak256(abi.encodePacked(attestationHash, msg.sender));
        address signer = messageHash.recover(message.signature);

        require(signer == msg.sender, "MetadataRegistry: invalid signature");
        require(message.sourceChainId == block.chainid, "MetadataRegistry: invalid source chain");

        _usedAttestations[attestationHash] = true;

        // Create or update record for target chain
        ENSMetadataTypes.MetadataRecord storage record = records[message.metadataHash];

        if (record.timestamp == 0) {
            record.metadataHash = message.metadataHash;
            record.gateway = message.gateway;
            record.path = message.path;
            record.timestamp = block.timestamp;
            record.attester = msg.sender;
            record.active = true;
            record.chainId = targetChainId;

            totalRecords++;
            activeRecords++;
            _metadataHashesByChain[targetChainId].push(message.metadataHash);
        } else {
            record.timestamp = block.timestamp;
        }

        emit CrossChainMetadataAssigned(message.metadataHash, targetChainId, message.ensNode);
    }

    /// @inheritdoc IMetadataRegistry
    function verifyAttestation(
        bytes32 metadataHash,
        address attester,
        bytes calldata signature
    ) external view override returns (bool valid) {
        bytes32 messageHash = keccak256(abi.encodePacked(metadataHash, attester, block.timestamp));
        address signer = messageHash.recover(signature);
        return signer == attester;
    }

    /// @inheritdoc IMetadataRegistry
    function getRegistryStats() external view override returns (
        uint256 totalRecords_,
        uint256 activeRecords_,
        uint256 totalAttesters,
        uint256 supportedChainsCount
    ) {
        totalRecords_ = totalRecords;
        activeRecords_ = activeRecords;

        // Count authorized attesters (simplified - in production would use enumerable set)
        uint256 attesterCount = 0;
        if (authorizedAttesters[owner()]) attesterCount++;

        // Count supported chains (simplified - in production would use enumerable set)
        uint256 chainCount = 0;
        if (supportedChains[1]) chainCount++; // Ethereum mainnet

        return (totalRecords_, activeRecords_, attesterCount, chainCount);
    }

    /// @notice Calculate fee for metadata registration based on calldata size
    /// @param user Address of the user registering metadata
    /// @param gateway Gateway URL string
    /// @param path Path string
    /// @param metadata Metadata JSON string
    /// @return fee Fee amount in wei
    function calculateFee(
        address user,
        string calldata gateway,
        string calldata path,
        string calldata metadata
    ) public view returns (uint256 fee) {
        uint256 gatewayLength = bytes(gateway).length;
        uint256 pathLength = bytes(path).length;
        uint256 metadataSize = bytes(metadata).length;

        return calculateDataSizeFee(user, gatewayLength, pathLength, metadataSize);
    }

    /// @notice Calculate fee based on calldata size and complexity
    /// @param user Address of the user
    /// @param gatewayLength Length of gateway URL string
    /// @param pathLength Length of path string
    /// @param metadataSize Size of metadata JSON in bytes
    /// @return fee Fee amount in wei
    function calculateDataSizeFee(
        address user,
        uint256 gatewayLength,
        uint256 pathLength,
        uint256 metadataSize
    ) public view returns (uint256 fee) {
        // Check if user is exempted
        if (exemptedUsers[user]) {
            return 0;
        }

        // Get user tier
        FeeTier memory tier = userTiers[user];
        if (!tier.enabled) {
            tier = defaultFeeTier;
        }

        // Calculate data size in bytes (strings are stored as bytes)
        uint256 totalDataSize = gatewayLength + pathLength + metadataSize;

        // Base fee per byte (in USD scaled by 1e18)
        uint256 baseRatePerByte = tier.baseRate / 1000; // $0.025 per KB

        // Calculate base fee in USD
        uint256 baseFeeUSD = (totalDataSize * baseRatePerByte) / 1024; // Convert to KB

        // Apply gas price adjustment
        baseFeeUSD = adjustForGasPrice(baseFeeUSD);

        // Convert USD to ETH
        uint256 feeInETH = (baseFeeUSD * 1e18) / ethPriceUSD;

        // Convert ETH to wei
        fee = feeInETH;

        return fee;
    }

    /// @notice Adjust fee based on current gas price
    /// @param baseFeeUSD Base fee in USD (scaled by 1e18)
    /// @return adjustedFee Adjusted fee in USD (scaled by 1e18)
    function adjustForGasPrice(uint256 baseFeeUSD) public view returns (uint256 adjustedFee) {
        uint256 gasPrice = currentGasPrice;

        if (gasPrice > 50 gwei) {
            return baseFeeUSD * 110 / 100; // 10% premium during high gas
        } else if (gasPrice < 15 gwei) {
            return baseFeeUSD * 90 / 100;  // 10% discount during low gas
        }

        return baseFeeUSD;
    }

    /// @notice Update user statistics after registration
    /// @param user Address of the user
    /// @param feeAmount Fee amount paid
    /// @param dataSize Size of calldata processed
    function _updateUserStats(address user, uint256 feeAmount, uint256 dataSize) internal {
        UserStats storage stats = userStats[user];

        // Initialize first registration timestamp if this is the first registration
        if (stats.firstRegistration == 0) {
            stats.firstRegistration = block.timestamp;
        }

        stats.totalRegistrations++;
        stats.totalDataSize += dataSize;
        stats.totalPaid += feeAmount;
    }

    /// @notice Distribute collected fees to beneficiaries
    /// @param totalFee Total fee amount to distribute
    function _distributeFees(uint256 totalFee) internal {
        require(feeBeneficiaries.length == beneficiaryShares.length, "MetadataRegistry: invalid beneficiaries");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < beneficiaryShares.length; i++) {
            totalShares += beneficiaryShares[i];
        }

        require(totalShares == 100, "MetadataRegistry: shares must sum to 100");

        uint256[] memory amounts = new uint256[](feeBeneficiaries.length);

        for (uint256 i = 0; i < feeBeneficiaries.length; i++) {
            amounts[i] = (totalFee * beneficiaryShares[i]) / 100;
            if (amounts[i] > 0) {
                payable(feeBeneficiaries[i]).transfer(amounts[i]);
            }
        }

        totalFeesCollected += totalFee;

        emit FeeDistributed(totalFee, feeBeneficiaries, amounts);
    }

    /// @notice Set fee tier for user
    /// @param user Address of the user
    /// @param baseRate Base fee rate per KB in USD (scaled by 1e18)
    /// @param monthlyCap Monthly spending cap
    function setUserFeeTier(
        address user,
        uint256 baseRate,
        uint256 monthlyCap
    ) external onlyOwner {
        userTiers[user] = FeeTier({
            baseRate: baseRate,
            monthlyCap: monthlyCap,
            discountRate: 0,        // No discounts in data-size based system
            enabled: true
        });

        emit FeeTierUpdated(user, baseRate, monthlyCap);
    }

    /// @notice Exempt user from fees
    /// @param user Address to exempt
    /// @param exempted Whether to exempt or not
    function setUserExemption(address user, bool exempted) external onlyOwner {
        exemptedUsers[user] = exempted;
        emit UserExempted(user, exempted);
    }

    /// @notice Exempt category from fees
    /// @param category Category to exempt
    /// @param exempted Whether to exempt or not
    function setCategoryExemption(string calldata category, bool exempted) external onlyOwner {
        exemptedCategories[category] = exempted;
        emit CategoryExempted(category, exempted);
    }

    /// @notice Update gas price for fee calculation
    /// @param newGasPrice New gas price in gwei
    function updateGasPrice(uint256 newGasPrice) external onlyOwner {
        uint256 oldPrice = currentGasPrice;
        currentGasPrice = newGasPrice;
        emit GasPriceUpdated(oldPrice, newGasPrice);
    }

    /// @notice Update ETH price for fee calculation
    /// @param newEthPrice New ETH price in USD (scaled by 1e18)
    function updateETHPrice(uint256 newEthPrice) external onlyOwner {
        uint256 oldPrice = ethPriceUSD;
        ethPriceUSD = newEthPrice;
        emit ETHPriceUpdated(oldPrice, newEthPrice);
    }

    /// @notice Update fee beneficiaries and their shares
    /// @param beneficiaries Array of beneficiary addresses
    /// @param shares Array of percentage shares (must sum to 100)
    function updateFeeBeneficiaries(
        address[] calldata beneficiaries,
        uint256[] calldata shares
    ) external onlyOwner {
        require(beneficiaries.length == shares.length, "MetadataRegistry: arrays length mismatch");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 100, "MetadataRegistry: shares must sum to 100");

        feeBeneficiaries = beneficiaries;
        beneficiaryShares = shares;
    }

    /// @notice Get user statistics
    /// @param user Address of the user
    /// @return stats User statistics
    function getUserStats(address user) external view returns (UserStats memory stats) {
        return userStats[user];
    }

    /// @notice Check if user is exempted from fees
    /// @param user Address to check
    /// @param metadataHash Hash of metadata (for category checking)
    /// @return exempted Whether user is exempted
    function isExempted(address user, bytes32 metadataHash) public view returns (bool exempted) {
        if (exemptedUsers[user]) {
            return true;
        }

        // In production, would parse metadata to extract category
        // For now, assume basic exemption check
        return false;
    }

    /// @notice Withdraw accumulated fees (emergency function)
    /// @param amount Amount to withdraw
    function withdrawFees(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "MetadataRegistry: insufficient balance");
        payable(owner()).transfer(amount);
    }

    /// @notice Set CCIP router address
    /// @param _ccipRouter New CCIP router address
    function setCCIPRouter(address _ccipRouter) external onlyOwner {
        require(_ccipRouter != address(0), "MetadataRegistry: invalid CCIP router address");
        ccipRouter = _ccipRouter;
    }

    /// @notice Set ENS registry address
    /// @param _ensRegistry New ENS registry address
    function setENSRegistry(address _ensRegistry) external onlyOwner {
        require(_ensRegistry != address(0), "MetadataRegistry: invalid ENS registry address");
        ensRegistry = _ensRegistry;
    }

    /// @notice Set metadata validator address
    /// @param _metadataValidator New metadata validator address
    function setMetadataValidator(address _metadataValidator) external onlyOwner {
        require(_metadataValidator != address(0), "MetadataRegistry: invalid validator address");
        metadataValidator = _metadataValidator;
    }

    /// @notice Emergency pause function
    /// @param paused Whether to pause the contract
    function setPaused(bool paused) external onlyOwner {
        if (paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    /// @notice Get metadata hashes with pagination
    /// @param startIndex Start index for pagination
    /// @param count Number of records to return
    /// @return hashes Array of metadata hashes
    function getMetadataHashesPaginated(uint256 startIndex, uint256 count)
        external view returns (bytes32[] memory hashes)
    {
        // This is a simplified implementation
        // In production, would need to maintain an array of all hashes
        return new bytes32[](0);
    }
}
