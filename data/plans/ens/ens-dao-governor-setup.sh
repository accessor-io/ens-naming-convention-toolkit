#!/bin/bash
# Subdomain Registration Script for ens
# Generated on 2025-10-10T00:26:10.150Z
# Category: dao, Type: governor
#
# Prerequisites:
# 1. Install ens-metadata-tools: npm install
# 2. Connect wallet or set RPC: --rpc-url <url> --private-key <key>
# 3. Ensure you own the parent domain

# Register primary domain
echo "Registering primary domain: dao.evmd.eth"
node bin/ens-contract.js register dao.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Register protocol subdomain
echo "Registering protocol subdomain: ens.dao.evmd.eth"
node bin/ens-contract.js register ens.dao.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for protocol domain
echo "Setting resolver for ens.dao.evmd.eth"
node bin/ens-contract.js set-resolver ens.dao.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ens.eth
echo "Registering subdomain: ens.eth"
node bin/ens-contract.js register ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ens.eth
node bin/ens-contract.js set-resolver ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── governance.ens.eth
echo "Registering subdomain: ├── governance.ens.eth"
node bin/ens-contract.js register ├── governance.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── governance.ens.eth
node bin/ens-contract.js set-resolver ├── governance.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   ├── governor.governance.ens.eth
echo "Registering subdomain: │   ├── governor.governance.ens.eth"
node bin/ens-contract.js register │   ├── governor.governance.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   ├── governor.governance.ens.eth
node bin/ens-contract.js set-resolver │   ├── governor.governance.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   ├── token.governance.ens.eth
echo "Registering subdomain: │   ├── token.governance.ens.eth"
node bin/ens-contract.js register │   ├── token.governance.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   ├── token.governance.ens.eth
node bin/ens-contract.js set-resolver │   ├── token.governance.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   ├── timelock.governance.ens.eth
echo "Registering subdomain: │   ├── timelock.governance.ens.eth"
node bin/ens-contract.js register │   ├── timelock.governance.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   ├── timelock.governance.ens.eth
node bin/ens-contract.js set-resolver │   ├── timelock.governance.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   └── treasury.governance.ens.eth
echo "Registering subdomain: │   └── treasury.governance.ens.eth"
node bin/ens-contract.js register │   └── treasury.governance.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   └── treasury.governance.ens.eth
node bin/ens-contract.js set-resolver │   └── treasury.governance.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── operations.ens.eth
echo "Registering subdomain: ├── operations.ens.eth"
node bin/ens-contract.js register ├── operations.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── operations.ens.eth
node bin/ens-contract.js set-resolver ├── operations.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   ├── wallet.operations.ens.eth
echo "Registering subdomain: │   ├── wallet.operations.ens.eth"
node bin/ens-contract.js register │   ├── wallet.operations.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   ├── wallet.operations.ens.eth
node bin/ens-contract.js set-resolver │   ├── wallet.operations.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   ├── delegate.operations.ens.eth
echo "Registering subdomain: │   ├── delegate.operations.ens.eth"
node bin/ens-contract.js register │   ├── delegate.operations.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   ├── delegate.operations.ens.eth
node bin/ens-contract.js set-resolver │   ├── delegate.operations.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: │   └── emergency.operations.ens.eth
echo "Registering subdomain: │   └── emergency.operations.ens.eth"
node bin/ens-contract.js register │   └── emergency.operations.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for │   └── emergency.operations.ens.eth
node bin/ens-contract.js set-resolver │   └── emergency.operations.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: └── meta.ens.eth
echo "Registering subdomain: └── meta.ens.eth"
node bin/ens-contract.js register └── meta.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for └── meta.ens.eth
node bin/ens-contract.js set-resolver └── meta.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain:     ├── docs.meta.ens.eth
echo "Registering subdomain:     ├── docs.meta.ens.eth"
node bin/ens-contract.js register     ├── docs.meta.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for     ├── docs.meta.ens.eth
node bin/ens-contract.js set-resolver     ├── docs.meta.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain:     ├── forum.meta.ens.eth
echo "Registering subdomain:     ├── forum.meta.ens.eth"
node bin/ens-contract.js register     ├── forum.meta.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for     ├── forum.meta.ens.eth
node bin/ens-contract.js set-resolver     ├── forum.meta.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain:     └── discord.meta.ens.eth
echo "Registering subdomain:     └── discord.meta.ens.eth"
node bin/ens-contract.js register     └── discord.meta.ens.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for     └── discord.meta.ens.eth
node bin/ens-contract.js set-resolver     └── discord.meta.ens.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Set cross-references

echo "Registration script completed!"
echo "Check domain info with: node bin/ens-contract.js info <domain>"