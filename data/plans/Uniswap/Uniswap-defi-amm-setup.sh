#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2025-10-10T00:26:13.267Z
# Category: defi, Type: amm
#
# Prerequisites:
# 1. Install ens-metadata-tools: npm install
# 2. Connect wallet or set RPC: --rpc-url <url> --private-key <key>
# 3. Ensure you own the parent domain

# Register primary domain
echo "Registering primary domain: defi.evmd.eth"
node bin/ens-contract.js register defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Register protocol subdomain
echo "Registering protocol subdomain: uniswap.defi.evmd.eth"
node bin/ens-contract.js register uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for protocol domain
echo "Setting resolver for uniswap.defi.evmd.eth"
node bin/ens-contract.js set-resolver uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: amm.uniswap.defi.evmd.eth
echo "Registering subdomain: amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── factory.amm.uniswap.defi.evmd.eth
echo "Registering subdomain: ├── factory.amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register ├── factory.amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── factory.amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver ├── factory.amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── router.amm.uniswap.defi.evmd.eth
echo "Registering subdomain: ├── router.amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register ├── router.amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── router.amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver ├── router.amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── quoter.amm.uniswap.defi.evmd.eth
echo "Registering subdomain: ├── quoter.amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register ├── quoter.amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── quoter.amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver ├── quoter.amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: ├── {variant}.amm.uniswap.defi.evmd.eth
echo "Registering subdomain: ├── {variant}.amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register ├── {variant}.amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for ├── {variant}.amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver ├── {variant}.amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: └── positions.amm.uniswap.defi.evmd.eth
echo "Registering subdomain: └── positions.amm.uniswap.defi.evmd.eth"
node bin/ens-contract.js register └── positions.amm.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for └── positions.amm.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver └── positions.amm.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: amm.v2.uniswap.defi.evmd.eth
echo "Registering subdomain: amm.v2.uniswap.defi.evmd.eth"
node bin/ens-contract.js register amm.v2.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for amm.v2.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver amm.v2.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: └── factory.amm.v2.uniswap.defi.evmd.eth
echo "Registering subdomain: └── factory.amm.v2.uniswap.defi.evmd.eth"
node bin/ens-contract.js register └── factory.amm.v2.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for └── factory.amm.v2.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver └── factory.amm.v2.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Register subdomain: amm.legacy.uniswap.defi.evmd.eth
echo "Registering subdomain: amm.legacy.uniswap.defi.evmd.eth"
node bin/ens-contract.js register amm.legacy.uniswap.defi.evmd.eth --owner ${OWNER_ADDRESS:-"0x0000000000000000000000000000000000000000"}

# Set resolver for amm.legacy.uniswap.defi.evmd.eth
node bin/ens-contract.js set-resolver amm.legacy.uniswap.defi.evmd.eth --address ${RESOLVER_ADDRESS:-"0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"}

# Set cross-references

echo "Registration script completed!"
echo "Check domain info with: node bin/ens-contract.js info <domain>"