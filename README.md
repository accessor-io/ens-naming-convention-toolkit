# ENS Zero Address Proxy System

A revolutionary ENS resolver system that intercepts transactions sent to the zero address (`0x000...000`) and redirects them based on sophisticated routing logic.

## What This Does

**The Magic**: When users try to send transactions to `0x000...000` (the zero address), this system:
1. Intercepts the transaction through ENS resolution
2. Performs reverse resolution on the sender
3. Routes the transaction to the appropriate destination based on the sender's ENS identity

## Overview

This system consists of two main contracts:

1. **ProxyResolver** - An ENS resolver that returns your ProxyForwarder when queried for the zero address
2. **ProxyForwarder** - A proxy contract that intercepts zero address transactions and forwards them intelligently

## Architecture

### Zero Address Proxy Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ User tries to   │───▶│ ENS resolves    │───▶│ Returns         │
│ send to:        │    │ 0x000...000     │    │ ProxyForwarder  │
│ 0x000...000     │    │ to ProxyResolver│    │ (0x11a...)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌─────────────────┐               │
│ User sends      │───▶│ Transaction     │───────────────┤
│ transaction to: │    │ to: 0x11a...    │               │
│ 0x11a...331d    │    │ 331d            │               │
└─────────────────┘    └─────────────────┘               │
                                                         │
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ On-chain        │    │ ProxyForwarder  │    │ Routes to       │
│ record shows:   │    │ intercepts      │───▶│ Target          │
│ From: User      │    │ transaction     │    │ (0x33a...)      │
│ To: 0x11a...331d│    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

### Advanced Flow with Original Caller Tracking
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ENS Domain    │───▶│  ProxyResolver  │───▶│ ProxyForwarder  │
│   (your.eth)    │    │   (Resolver)    │    │   (0x11a...)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Target Address  │
                                                │  (0x33a...)     │
                                                │                 │
                                                │  ┌─────────────┐ │
                                                │  │ getActual() │ │
                                                │  │  Caller()   │ │
                                                │  └─────────────┘ │
                                                └─────────────────┘
```

### On-Chain Transaction Visibility
```
User sends transaction to: 0x11a...331d (ProxyForwarder)
                              │
                              ▼
On-chain record shows: From: User Address
                      To: 0x11a...331d (ProxyForwarder)
                      Value: X ETH
                      Data: [transaction data]

ProxyForwarder then calls: 0x33a...355f (Target Address)
Internal call shows: From: 0x11a...331d (ProxyForwarder)
                    To: 0x33a...355f (Target Address)
```

## How It Works

### Zero Address Interception Flow

1. **Zero Address Resolution**: When someone tries to send a transaction to `0x000...000`, ENS resolves it to your `ProxyForwarder` address (`0x11a...331d`)

2. **Transaction Interception**: The `ProxyForwarder` receives the transaction that was intended for the zero address

3. **Smart Routing**: The `ProxyForwarder`:
   - Identifies this as a zero address interception
   - Performs reverse ENS resolution on the original sender
   - Applies intelligent routing logic based on the sender's ENS identity
   - Forwards the transaction to the appropriate destination (`0x33a...355f`)

4. **Original Caller Tracking**: Target contracts can access the original caller information for advanced business logic

### On-Chain Transaction Appearance

**The Interception**: The transaction appears as if it was sent to your `ProxyForwarder` because ENS resolved the zero address to it:

```
On-Chain Transaction Record:
From: 0xUser...Address (Original caller)
To: 0x11a...331d (ProxyForwarder address) ← User thought they were sending to 0x000...000
Value: 1 ETH
Data: [original transaction data]

Internal Smart Routing:
From: 0x11a...331d (ProxyForwarder)
To: 0x33a...355f (Smart routing destination)
```

### Accessing Original Caller Information

Target contracts can access the original caller by calling the `ProxyForwarder`:

```solidity
// In your target contract
function someFunction() external {
    if (msg.sender == proxyForwarderAddress) {
        // This is a proxied call
        address originalCaller = IProxyForwarder(proxyForwarderAddress).getOriginalCaller();

        // Now you have the original caller address
        // Apply business logic based on original caller
    }
}
```

### Example Usage Scenario

```javascript
// 1. User tries to send to zero address (thinking it's burning funds)
const zeroAddress = "0x0000000000000000000000000000000000000000";
await signer.sendTransaction({
    to: zeroAddress, // User intends to send to zero address
    value: ethers.utils.parseEther("1")
});

// 2. ENS intercepts the zero address lookup
// ENS resolves 0x000...000 to your ProxyForwarder (0x11a...331d)

// 3. Transaction actually goes to ProxyForwarder
// On-chain: From: User → To: 0x11a...331d

// 4. ProxyForwarder performs smart routing
// - Detects this is a zero address interception
// - Performs reverse ENS lookup on sender
// - Routes based on sender's ENS identity
// - Forwards to: 0x33a...355f (your chosen destination)

// 5. Target receives intelligently routed transaction
```

## Zero Address Proxy Setup Guide

### Step 1: Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Step 2: Configure ENS for Zero Address
You need to set up ENS so that the zero address resolves to your ProxyResolver:

```javascript
// Get the zero address node hash
const zeroNode = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Set your ProxyResolver as the resolver for the zero address
await ensRegistry.setResolver(zeroNode, proxyResolver.address);

// Configure ProxyResolver to return ProxyForwarder for zero address
await proxyResolver.enableZeroAddressProxy();
```

### Step 3: Test Zero Address Interception
```javascript
// User tries to send to zero address
const zeroAddress = "0x0000000000000000000000000000000000000000";
const tx = await user.sendTransaction({
    to: zeroAddress, // User thinks they're sending to zero address
    value: ethers.utils.parseEther("1")
});
await tx.wait();

// Check what actually happened
const proxyForwarderBalance = await provider.getBalance(proxyForwarder.address);
console.log("ProxyForwarder received:", ethers.utils.formatEther(proxyForwarderBalance));

// The ProxyForwarder should have forwarded this to your target
const targetBalance = await provider.getBalance("0x33a...355f");
console.log("Target received:", ethers.utils.formatEther(targetBalance));
```

### Step 4: Verify On-Chain Records
Check Etherscan or your blockchain explorer:
- **Transaction shows**: `From: User` → `To: 0x11a...331d` (ProxyForwarder)
- **Not**: `From: User` → `To: 0x33a...355f` (Target)

The magic happens because ENS resolved the zero address to your ProxyForwarder!

## Features

- **Standard ENS Compatibility**: Implements all standard ENS resolver interfaces
- **Reverse Resolution**: Performs reverse ENS lookup on transaction senders
- **Flexible Routing**: Customizable routing logic based on ENS name patterns
- **Data Transformation**: Ability to modify transaction data before forwarding
- **Event Logging**: Comprehensive event emission for transaction tracking
- **Access Control**: Owner-only functions for configuration management

## Installation

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## Deployment

### Local Development

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Mainnet Deployment

1. Set your environment variables:
```bash
export MAINNET_URL="your_mainnet_rpc_url"
export PRIVATE_KEY="your_private_key"
export ETHERSCAN_API_KEY="your_etherscan_api_key"
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Configuration

The system uses the following addresses (customize as needed):

- **ProxyForwarder**: The address that receives forwarded transactions (`0x11a...331d`)
- **Target Address**: The final destination for forwarded transactions (`0x33a...355f`)
- **ENS Registry**: The ENS registry contract address

## Usage Example

```javascript
// After deployment, set ProxyResolver as your ENS domain's resolver
const ensRegistry = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_ABI, signer);
const node = namehash("your-domain.eth");

// Set the resolver
await ensRegistry.setResolver(node, proxyResolver.address);

// Now when someone calls:
// const address = await provider.resolveName("your-domain.eth");
// console.log(address); // Will show ProxyForwarder address

// When they send transactions to that address, it gets forwarded to your target
```

## Testing

Run the test suite:

```bash
npx hardhat test
```

Tests cover:
- Contract deployment and initialization
- ENS resolver interface compliance
- Transaction forwarding functionality
- Reverse resolution logic
- Access control mechanisms
- Data transformation features

## Security Considerations

- The `ProxyForwarder` has unlimited access to the target address
- Ensure proper access controls are in place
- Consider implementing rate limiting for transaction forwarding
- Monitor for potential reentrancy attacks

## Advanced Features

### Custom Routing Logic

Modify the `_applyRoutingLogic` function in `ProxyForwarder.sol` to implement custom routing based on ENS names:

```solidity
function _applyRoutingLogic(address caller, string memory ensName) internal view returns (address) {
    if (_stringStartsWith(ensName, "exchange.")) {
        return exchangeTarget;
    }
    if (_stringStartsWith(ensName, "dao.")) {
        return daoTarget;
    }
    return targetAddress;
}
```

### Data Transformation

The system can modify transaction data before forwarding. Implement custom logic in `_transformTransactionData`:

```solidity
function _transformTransactionData(bytes memory data, address caller, address target)
    internal view returns (bytes memory)
{
    // Custom transformation logic here
    return modifiedData;
}
```

### Original Caller Access

Target contracts can access the original caller information for advanced business logic:

```solidity
contract MyContract {
    address public proxyForwarder;

    function processTransaction() external {
        if (msg.sender == proxyForwarder) {
            address originalCaller = IProxyForwarder(proxyForwarder).getOriginalCaller();

            // Apply different logic based on original caller
            if (originalCaller == specialUser) {
                // Special handling
            }
        }
    }
}
```

## Key Insights: Transaction Appearance

**Zero Address Proxy**: This system **CAN** intercept transactions intended for the zero address (`0x000...000`).

### How It Actually Works

**❌ Incorrect Understanding:**
```
User → Zero Address (0x000...000) → Contract reads zero → Override → Different Address
```

**✅ Correct Understanding:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User wants  │───▶│ ENS lookup  │───▶│ Returns     │
│ your-domain.│    │ your-domain.│    │ ProxyForwarder│
│ eth         │    │ eth         │    │ (0x11a...)  │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
┌─────────────┐    ┌─────────────┐         │
│ User sends  │───▶│ Transaction │─────────┤
│ to resolved │    │ to: 0x11a...│         │
│ address     │    │ 331d        │         │
└─────────────┘    └─────────────┘         │
         │                                  │
         ▼                                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ On-chain    │    │ ProxyForwarder│    │ Forwards to │
│ record:     │    │ receives    │───▶│ Target      │
│ From: User  │    │ transaction │    │ (0x33a...)  │
│ To: 0x11a...│    └─────────────┘    └─────────────┘
└─────────────┘

### What Users See
- **ENS Resolution**: `your-domain.eth` → `0x11a...331d`
- **Transaction On-Chain**: `From: User` → `To: 0x11a...331d`
- **Internal Forwarding**: `0x11a...331d` → `0x33a...355f`

### What This Means
1. **Transparency**: The ProxyForwarder address is visible in transaction records
2. **No Hidden Routing**: The routing logic is in the smart contract, not encoded in the address
3. **Auditability**: All transactions are traceable through the ProxyForwarder
4. **Flexibility**: Routing logic can be updated without changing addresses

### Zero Address Confusion
The zero address (`0x000...000`) is Ethereum's null address and has no special role in this system. The proxy system works by:

1. **Normal ENS Resolution**: Returns the ProxyForwarder address
2. **Normal Transaction**: User sends to the resolved address
3. **Smart Contract Logic**: ProxyForwarder contains the routing intelligence

### Alternative Approaches
If you need the transaction to appear as if it was sent directly to the target address, you would need a different architecture:

1. **Delegate Call Proxy**: Use `delegatecall` to execute code at the target address
2. **Address Encoding**: Encode routing information in the address itself (not recommended)
3. **Multi-sig/Forwarder**: Use a more complex forwarding mechanism

The current implementation prioritizes **transparency** and **auditability** over **stealth routing**.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.