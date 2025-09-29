#!/bin/bash
# Subdomain Registration Script for axie
# Generated on 2025-09-26T20:52:42.662Z
# Category: gaming, Type: nft

# Register primary domain
ens-contract register axie.gaming.eth --type nft

# Register subdomain: <game>.gaming.eth
ens-contract register <game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: ├── assets.<game>.gaming.eth
ens-contract register ├── assets.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   ├── collection.assets.<game>.gaming.eth
ens-contract register │   ├── collection.assets.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   ├── marketplace.assets.<game>.gaming.eth
ens-contract register │   ├── marketplace.assets.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   └── staking.assets.<game>.gaming.eth
ens-contract register │   └── staking.assets.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: ├── gameplay.<game>.gaming.eth
ens-contract register ├── gameplay.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   ├── mechanics.gameplay.<game>.gaming.eth
ens-contract register │   ├── mechanics.gameplay.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   ├── rewards.gameplay.<game>.gaming.eth
ens-contract register │   ├── rewards.gameplay.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: │   └── achievements.gameplay.<game>.gaming.eth
ens-contract register │   └── achievements.gameplay.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain: └── social.<game>.gaming.eth
ens-contract register └── social.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain:     ├── guilds.social.<game>.gaming.eth
ens-contract register     ├── guilds.social.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain:     ├── tournaments.social.<game>.gaming.eth
ens-contract register     ├── tournaments.social.<game>.gaming.eth --parent axie.gaming.eth

# Register subdomain:     └── chat.social.<game>.gaming.eth
ens-contract register     └── chat.social.<game>.gaming.eth --parent axie.gaming.eth

# Set cross-references