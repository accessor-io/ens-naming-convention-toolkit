#!/bin/bash
# Subdomain Registration Script for manhattan
# Generated on 2025-09-26T20:58:55.310Z
# Category: rwa, Type: realestate

# Register primary domain
ens-contract register manhattan.rwa.eth --type realestate

# Register subdomain: <property>.rwa.eth
ens-contract register <property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: ├── ownership.<property>.rwa.eth
ens-contract register ├── ownership.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   ├── registry.ownership.<property>.rwa.eth
ens-contract register │   ├── registry.ownership.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   ├── transfer.ownership.<property>.rwa.eth
ens-contract register │   ├── transfer.ownership.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   └── voting.ownership.<property>.rwa.eth
ens-contract register │   └── voting.ownership.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: ├── finance.<property>.rwa.eth
ens-contract register ├── finance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   ├── mortgage.finance.<property>.rwa.eth
ens-contract register │   ├── mortgage.finance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   ├── insurance.finance.<property>.rwa.eth
ens-contract register │   ├── insurance.finance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: │   └── dividends.finance.<property>.rwa.eth
ens-contract register │   └── dividends.finance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain: └── compliance.<property>.rwa.eth
ens-contract register └── compliance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain:     ├── legal.compliance.<property>.rwa.eth
ens-contract register     ├── legal.compliance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain:     ├── regulatory.compliance.<property>.rwa.eth
ens-contract register     ├── regulatory.compliance.<property>.rwa.eth --parent manhattan.rwa.eth

# Register subdomain:     └── audit.compliance.<property>.rwa.eth
ens-contract register     └── audit.compliance.<property>.rwa.eth --parent manhattan.rwa.eth

# Set cross-references