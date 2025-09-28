#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2025-09-26T20:42:46.946Z
# Category: defi, Type: amm

# Register primary domain
ens-contract register uniswap.defi.eth --type amm

# Register subdomain: v3.uniswap.amm.eth
ens-contract register v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: ├── factory.v3.uniswap.amm.eth
ens-contract register ├── factory.v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: ├── router.v3.uniswap.amm.eth
ens-contract register ├── router.v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: ├── quoter.v3.uniswap.amm.eth
ens-contract register ├── quoter.v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: ├── multicall.v3.uniswap.amm.eth
ens-contract register ├── multicall.v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: └── positions.v3.uniswap.amm.eth
ens-contract register └── positions.v3.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: v2.uniswap.amm.eth
ens-contract register v2.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: └── factory.v2.uniswap.amm.eth
ens-contract register └── factory.v2.uniswap.amm.eth --parent uniswap.defi.eth

# Register subdomain: legacy.uniswap.amm.eth
ens-contract register legacy.uniswap.amm.eth --parent uniswap.defi.eth

# Set cross-references