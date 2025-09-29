#!/bin/bash
# Subdomain Registration Script for Uniswap
# Generated on 2025-09-29T01:16:15.692Z
# Category: defi, Type: amm

# Register primary domain
ens-contract register defi.evmd.eth --type defi

# Register protocol subdomain
ens-contract register Uniswap.defi.evmd.eth --parent defi.evmd.eth --type amm

# Register subdomain: amm.Uniswap.defi.evmd.eth
ens-contract register amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: ├── factory.amm.Uniswap.defi.evmd.eth
ens-contract register ├── factory.amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: ├── router.amm.Uniswap.defi.evmd.eth
ens-contract register ├── router.amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: ├── quoter.amm.Uniswap.defi.evmd.eth
ens-contract register ├── quoter.amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: ├── multicall.amm.Uniswap.defi.evmd.eth
ens-contract register ├── multicall.amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: └── positions.amm.Uniswap.defi.evmd.eth
ens-contract register └── positions.amm.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: amm.v2.Uniswap.defi.evmd.eth
ens-contract register amm.v2.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: └── factory.amm.v2.Uniswap.defi.evmd.eth
ens-contract register └── factory.amm.v2.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Register subdomain: amm.legacy.Uniswap.defi.evmd.eth
ens-contract register amm.legacy.Uniswap.defi.evmd.eth --parent Uniswap.defi.evmd.eth

# Set cross-references