#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2025-09-29T21:41:52.242Z
# Category: defi, Type: amm

# Register primary domain
ens-contract register defi.evmd.eth --type defi

# Set metadata for category root
ens-contract metadata defi.evmd.eth --data "{"category":"defi","type":"category-root","contractName":"DEFI Category Root","description":"defi category root domain under evmd.eth","level":"category","lastUpdated":"2025-09-29T21:41:52.236Z"}"

# Register protocol subdomain
ens-contract register uniswap.defi.evmd.eth --parent defi.evmd.eth --type amm

# Set metadata for protocol root
ens-contract metadata uniswap.defi.evmd.eth --data "{"category":"defi","type":"amm","contractName":"UNISWAP DEFI Protocol Root","description":"uniswap defi protocol root domain","level":"protocol","lastUpdated":"2025-09-29T21:41:52.238Z"}"

# Register subdomain: amm.uniswap.defi.evmd.eth
ens-contract register amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: factory.amm.uniswap.defi.evmd.eth
ens-contract register factory.amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: router.amm.uniswap.defi.evmd.eth
ens-contract register router.amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: quoter.amm.uniswap.defi.evmd.eth
ens-contract register quoter.amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: multicall.amm.uniswap.defi.evmd.eth
ens-contract register multicall.amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: positions.amm.uniswap.defi.evmd.eth
ens-contract register positions.amm.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: amm.v2.uniswap.defi.evmd.eth
ens-contract register amm.v2.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: factory.amm.v2.uniswap.defi.evmd.eth
ens-contract register factory.amm.v2.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Register subdomain: amm.legacy.uniswap.defi.evmd.eth
ens-contract register amm.legacy.uniswap.defi.evmd.eth --parent uniswap.defi.evmd.eth

# Set cross-references