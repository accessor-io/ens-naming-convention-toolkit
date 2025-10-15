# ENS Metadata Tools Documentation

Welcome to the ENS Metadata Tools documentation. This toolkit provides standardized metadata management, security analysis, and subdomain planning for Ethereum Name Service (ENS) domains and contracts.

## Quick Start

- [Getting Started](Getting-Started.md) - Installation and setup with beautiful examples
- [Overview](Overview.md) - Software description and purpose
- [Architecture](Architecture.md) - System design and data flow
- [Tutorials](Tutorials.md) - Step-by-step guides for common workflows

## Core Documentation

### System Understanding

- [Architecture](Architecture.md) - System design, data flow, and component relationships
- [Interconnectivity](Interconnectivity.md) - How components work together and data flows
- [Results and Workflows](Results-and-Workflows.md) - Understanding tool outputs and workflow patterns

### Command Reference

- [CLI Commands](commands/) - Complete command reference
  - [ens-metadata](commands/ens-metadata.md) - Main CLI entry point
  - [ens-validator](commands/ens-validator.md) - Domain validation
  - [metadata-generator](commands/metadata-generator.md) - Metadata generation
  - [subdomain-planner](commands/subdomain-planner.md) - Subdomain planning
  - [security-analyzer](commands/security-analyzer.md) - Security analysis
  - [ens-contract](commands/ens-contract.md) - ENS operations
  - [ens-cache-browser](commands/ens-cache-browser.md) - Cache browser
  - [evmd](commands/evmd.md) - EVM metadata operations

### Tools and Utilities

- [Tools](Tools.md) - Local tools and utilities overview
- [File Reference](file-reference/) - Technical analysis of tool functions
  - [Bin Tools](file-reference/bin-tools.md) - Core CLI tools
  - [Prober Tools](file-reference/prober-tools.md) - Contract probing tools
  - [Scripts](file-reference/scripts.md) - Analysis and utility scripts

### API Documentation

- [JavaScript/TypeScript API](api/JS-TS.md) - Programmatic usage with comprehensive examples
- [REST API](api/REST.md) - HTTP endpoint usage (optional integration)
- [Generated API Docs](api/) - TypeDoc generated documentation with enhanced features
- [FAQ](api/FAQ.md) - Frequently asked questions and answers
- [Quick Reference](api/Quick-Reference.md) - Quick reference cards for common operations
- [Best Practices](api/Best-Practices.md) - Production-ready guidelines and recommendations
- [User Journey Map](api/User-Journey.md) - Navigate documentation based on your role and goals

## Specialized Documentation

### System Components

- [Hierarchical Schema System](HIERARCHICAL-SCHEMA-SYSTEM.md) - Schema design and inheritance
- [QA Specification](QA-SPECIFICATION.md) - Quality assurance standards
- [Proxy Contract Handling](PROXY-CONTRACT-HANDLING.md) - Proxy pattern management
- [ENS Operations](ENS-OPERATIONS.md) - ENS contract interactions

### Data and Configuration

- [Root Domains](ROOT-DOMAINS.md) - Root domain management
- [CLI Commands Reference](CLI-COMMANDS.md) - Legacy command reference
- [Category Registry](category-registry.json) - Protocol categories
- [Root Domains Data](root-domains.json) - Root domain definitions

## Usage Patterns

### Common Workflows

1. **Protocol Onboarding**: Generate metadata → Validate → Plan subdomains → Register
2. **Security Assessment**: Analyze security → Implement fixes → Validate improvements
3. **Contract Discovery**: Probe contracts → Generate metadata → Plan domains
4. **Compliance Validation**: Validate metadata → Check security → Generate reports

### Integration Patterns

- **Sequential**: Output from one tool feeds into the next
- **Parallel**: Multiple tools process the same input simultaneously
- **Feedback**: Results inform improvements in other tools
- **Hierarchical**: Core operations support higher-level tools

## Getting Help

### Quick Help

- [FAQ](api/FAQ.md) - Frequently asked questions and answers
- [Quick Reference](api/Quick-Reference.md) - Quick reference cards for common operations
- [User Journey Map](api/User-Journey.md) - Navigate documentation based on your role and goals

### Troubleshooting

- [Troubleshooting Guide](Troubleshooting.md) - Comprehensive problem-solving guide
- Check [Getting Started](Getting-Started.md) for installation issues
- Review [Architecture](Architecture.md) for system understanding
- Consult [Results and Workflows](Results-and-Workflows.md) for output interpretation

### Support

- Use `--help` flag with any command
- Check logs with `--verbose` flag
- Review error messages for specific guidance
- Consult command documentation for examples
- Check [Tutorials](Tutorials.md) for step-by-step guidance
- Follow [Best Practices](api/Best-Practices.md) for production guidelines

## Contributing

### Documentation Updates

- Follow technical writing standards
- Use consistent formatting and structure
- Include practical examples
- Cross-reference related documentation

### Code Contributions

- See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines
- Follow established patterns and conventions
- Include tests for new functionality
- Update documentation as needed

## License

This documentation is part of the ENS Metadata Tools project, licensed under MIT License. See [LICENSE](../LICENSE) for details.

---

_Last updated: 2024-01-15_
