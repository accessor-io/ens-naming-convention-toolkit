# Project Organization Guide

## Directory Structure

This ENS Metadata Tools project is organized as follows:

```
├── aws/                    # AWS Infrastructure & Deployment
│   ├── cdk/               # AWS CDK Infrastructure as Code
│   │   └── lib/ens-metadata-tools-stack.ts
│   ├── lambda/            # Lambda Function Implementations
│   │   ├── metadata-generator/
│   │   ├── probe-multicall/
│   │   ├── lookup-resolver-names/
│   │   └── security-analyzer/
│   ├── layers/            # Shared Lambda Layers (ethers.js)
│   ├── scripts/           # AWS Deployment Scripts
│   └── cloudformation/    # CI/CD Pipeline
├── bin/                   # CLI Tools & Executables
│   ├── cli.js            # Main CLI
│   ├── metadata-generator.mjs
│   ├── contract-resolver-cli.js
│   └── security-analyzer.js
├── data/                  # Data Files & Configurations
│   ├── metadata/         # Generated Metadata Files
│   │   ├── *.defi-metadata.json
│   │   └── uniswap.defi-metadata.json
│   └── plans/            # Project Plans & Configurations
│       ├── uniswap-defi-amm-plan.json
│       └── ens/
├── docs/                  # Documentation
│   └── ENS-CONTRACT-RESOLVER-API.md
├── examples/              # Example Usage Scripts
│   └── test-ens-proxy.js
├── lib/                   # Core Library Code
│   └── contract-resolver.js
├── metadata/              # Metadata Generation & Templates
│   ├── protocols/        # Protocol-specific metadata
│   ├── templates/        # Metadata templates
│   ├── infrastructure/   # Infrastructure suggestions
│   └── *.metadata.json   # Generated metadata files
├── prober/               # ENS Resolver Probing Tools
│   ├── lookup-resolver-names.js
│   ├── probe-multicall.js
│   └── resolver-cache.json
├── scripts/              # Project Scripts
│   ├── setup/           # Setup & Generation Scripts
│   │   ├── uniswap-defi-amm-setup.sh
│   │   ├── lens-social-platform-setup.sh
│   │   └── axie-gaming-nft-setup.sh
│   └── deployment/      # Deployment Scripts
│       └── deploy.js
├── test/                 # Test Files
│   ├── ProxyForwarder.test.js
│   └── ProxyResolver.test.js
└── protocols/            # Protocol-Specific Configurations
```

## Organization Benefits

### Clean Separation of Concerns
- **AWS Infrastructure**: Isolated in `aws/` directory
- **Application Logic**: Core tools in `bin/` and `lib/`
- **Data & Configs**: Organized in `data/` directory
- **Generated Content**: Metadata in `metadata/` directory

### Easy Navigation
- **CLI Tools**: All executable scripts in `bin/`
- **Lambda Functions**: Organized by purpose in `aws/lambda/`
- **Deployment Scripts**: Centralized in `scripts/`
- **Documentation**: All docs in `docs/`

### Scalable Structure
- **Modular**: Each component has its own directory
- **Extensible**: Easy to add new protocols, tools, or infrastructure
- **Maintainable**: Clear boundaries between components

## Quick Start Guide

1. **Install Dependencies:**
   ```bash
   npm install
   cd aws/cdk && npm install
   ```

2. **Deploy Infrastructure:**
   ```bash
   cd aws/scripts
   ./deploy.sh
   ```

3. **Generate Metadata:**
   ```bash
   node bin/metadata-generator.mjs
   ```

4. **Run CLI Tools:**
   ```bash
   node bin/cli.js --help
   ```

## Key Directories Explained

### `aws/` - Cloud Infrastructure
- **CDK Stack**: Complete API Gateway + Lambda setup
- **Lambda Functions**: Serverless API endpoints
- **Layers**: Shared dependencies
- **Scripts**: Deployment automation

### `bin/` - Command Line Tools
- **CLI Interface**: Main command-line interface
- **Generators**: Metadata and contract generators
- **Analyzers**: Security and contract analysis tools

### `data/` - Data & Configurations
- **Metadata**: Generated protocol metadata
- **Plans**: Project configurations and plans
- **Configs**: Application configurations

### `metadata/` - Metadata System
- **Protocols**: Protocol-specific metadata
- **Templates**: Reusable metadata templates
- **Infrastructure**: System architecture metadata

### `prober/` - ENS Probing Tools
- **Resolver Discovery**: Find ENS resolvers
- **Multicall Probing**: Batch resolver queries
- **Cache Management**: Resolver caching system

## Maintenance

### Adding New Protocols
1. Create protocol config in `data/plans/`
2. Add metadata template in `metadata/templates/`
3. Create setup script in `scripts/setup/`
4. Update CLI tools in `bin/`

### Adding New Lambda Functions
1. Create function directory in `aws/lambda/`
2. Add to CDK stack in `aws/cdk/lib/`
3. Update API routes if needed
4. Add tests in appropriate location

### Adding New CLI Tools
1. Create tool in `bin/` directory
2. Update main CLI if needed
3. Add documentation in `docs/`
4. Create examples in `examples/`

This organization ensures the project remains maintainable and scalable as it grows!
