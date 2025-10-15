# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

Security vulnerabilities should be reported privately to avoid exposing users to potential risks.

### 2. Report via email

Send an email to: security@ens.domains

Include the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Resolution**: Within 30 days (depending on complexity)

### 4. Disclosure process

- We will work with you to understand and reproduce the issue
- We will develop a fix and test it thoroughly
- We will coordinate the release of the fix
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Keep tools updated**: Always use the latest version of the tools
2. **Validate metadata**: Use the validation tools before deploying
3. **Review security reports**: Run security analysis regularly
4. **Use strict mode**: Enable strict validation for production
5. **Verify addresses**: Always verify Ethereum addresses before use

### For Developers

1. **Input validation**: Validate all inputs thoroughly
2. **Error handling**: Implement proper error handling
3. **Dependencies**: Keep dependencies updated
4. **Testing**: Write tests for security-critical code
5. **Code review**: Review code for security issues

## Known Security Considerations

### ENS Domain Security

- **Fuse management**: Proper fuse configuration is critical for domain security
- **Resolver security**: Ensure resolvers are properly configured and secure
- **Subdomain control**: Be careful with subdomain permissions
- **Reverse resolution**: Consider implications of reverse resolution

### Metadata Security

- **Input validation**: All metadata should be validated before use
- **Schema compliance**: Ensure metadata follows established schemas
- **Cross-reference validation**: Verify cross-references are valid
- **Version management**: Keep track of metadata versions

### Tool Security

- **File operations**: Secure file handling and permissions
- **Network requests**: Validate all network requests
- **Configuration**: Secure configuration file handling
- **Logging**: Avoid logging sensitive information

## Security Tools

The toolkit includes several security analysis tools:

- **Security Analyzer**: `security-analyzer` command
- **Validation Suite**: Multiple validation commands
- **Fuse Analysis**: Fuse configuration analysis
- **Metadata Validation**: Comprehensive metadata checking

## Security Updates

Security updates are released as needed. Subscribe to:

- GitHub security advisories
- ENS community announcements
- Project releases

## Contact

For security-related questions or concerns:

- **Email**: security@ens.domains
- **GitHub**: Create a private security issue
- **Community**: ENS Discord security channel

## Acknowledgments

We thank the security researchers and community members who help keep ENS metadata tools secure.
