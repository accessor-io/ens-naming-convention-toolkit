#!/bin/bash
# Subdomain Registration Script for lens
# Generated on 2025-09-26T20:57:55.613Z
# Category: social, Type: platform

# Register primary domain
ens-contract register lens.social.eth --type platform

# Register subdomain: <platform>.social.eth
ens-contract register <platform>.social.eth --parent lens.social.eth

# Register subdomain: ├── content.<platform>.social.eth
ens-contract register ├── content.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   ├── posts.content.<platform>.social.eth
ens-contract register │   ├── posts.content.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   ├── media.content.<platform>.social.eth
ens-contract register │   ├── media.content.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   └── moderation.content.<platform>.social.eth
ens-contract register │   └── moderation.content.<platform>.social.eth --parent lens.social.eth

# Register subdomain: ├── users.<platform>.social.eth
ens-contract register ├── users.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   ├── profiles.users.<platform>.social.eth
ens-contract register │   ├── profiles.users.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   ├── connections.users.<platform>.social.eth
ens-contract register │   ├── connections.users.<platform>.social.eth --parent lens.social.eth

# Register subdomain: │   └── privacy.users.<platform>.social.eth
ens-contract register │   └── privacy.users.<platform>.social.eth --parent lens.social.eth

# Register subdomain: └── monetization.<platform>.social.eth
ens-contract register └── monetization.<platform>.social.eth --parent lens.social.eth

# Register subdomain:     ├── tokens.monetization.<platform>.social.eth
ens-contract register     ├── tokens.monetization.<platform>.social.eth --parent lens.social.eth

# Register subdomain:     ├── subscriptions.monetization.<platform>.social.eth
ens-contract register     ├── subscriptions.monetization.<platform>.social.eth --parent lens.social.eth

# Register subdomain:     └── ads.monetization.<platform>.social.eth
ens-contract register     └── ads.monetization.<platform>.social.eth --parent lens.social.eth

# Set cross-references