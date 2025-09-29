#!/bin/bash
# Subdomain Registration Script for ens
# Generated on 2025-09-29T01:00:48.416Z
# Category: dao, Type: governor

# Register primary domain
ens-contract register ens.dao.eth --type governor

# Register subdomain: ens.eth
ens-contract register ens.eth --parent ens.dao.eth

# Register subdomain: ├── governance.ens.eth
ens-contract register ├── governance.ens.eth --parent ens.dao.eth

# Register subdomain: │   ├── governor.governance.ens.eth
ens-contract register │   ├── governor.governance.ens.eth --parent ens.dao.eth

# Register subdomain: │   ├── token.governance.ens.eth
ens-contract register │   ├── token.governance.ens.eth --parent ens.dao.eth

# Register subdomain: │   ├── timelock.governance.ens.eth
ens-contract register │   ├── timelock.governance.ens.eth --parent ens.dao.eth

# Register subdomain: │   └── treasury.governance.ens.eth
ens-contract register │   └── treasury.governance.ens.eth --parent ens.dao.eth

# Register subdomain: ├── operations.ens.eth
ens-contract register ├── operations.ens.eth --parent ens.dao.eth

# Register subdomain: │   ├── wallet.operations.ens.eth
ens-contract register │   ├── wallet.operations.ens.eth --parent ens.dao.eth

# Register subdomain: │   ├── delegate.operations.ens.eth
ens-contract register │   ├── delegate.operations.ens.eth --parent ens.dao.eth

# Register subdomain: │   └── emergency.operations.ens.eth
ens-contract register │   └── emergency.operations.ens.eth --parent ens.dao.eth

# Register subdomain: └── meta.ens.eth
ens-contract register └── meta.ens.eth --parent ens.dao.eth

# Register subdomain:     ├── docs.meta.ens.eth
ens-contract register     ├── docs.meta.ens.eth --parent ens.dao.eth

# Register subdomain:     ├── forum.meta.ens.eth
ens-contract register     ├── forum.meta.ens.eth --parent ens.dao.eth

# Register subdomain:     └── discord.meta.ens.eth
ens-contract register     └── discord.meta.ens.eth --parent ens.dao.eth

# Set cross-references