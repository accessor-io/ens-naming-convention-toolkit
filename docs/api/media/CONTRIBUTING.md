# Contributing to ENS Metadata Tools

Thank you for your interest in contributing to ENS Metadata Tools! This document outlines our contribution process and coding standards.

## Quick Start

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/ens-metadata-tools.git
cd ens-metadata-tools

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run dev
```

## Development Workflow

### 1. Fork and Setup

- Fork the repository on GitHub
- Clone your fork: `git clone https://github.com/YOUR_USERNAME/ens-metadata-tools.git`
- Add upstream remote: `git remote add upstream https://github.com/ensdomains/ens-metadata-tools.git`

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Changes

- Follow the coding standards below
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass: `npm test`

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template completely
- Request review from maintainers

## Code Standards

### JavaScript/TypeScript

- **ES Modules**: Use `.mjs` extension for ES modules, `.cjs` for CommonJS when needed
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Line endings**: Unix (LF)

### File Organization

```
bin/                    # CLI executables
lib/                    # Shared libraries
tests/                   # Test files
docs/                   # Documentation
data/                   # Data files and schemas
scripts/                # Build scripts
```

### Naming Conventions

- **Files**: `kebab-case.mjs` (e.g., `metadata-generator.mjs`)
- **Classes**: `PascalCase` (e.g., `SubdomainPlanner`)
- **Functions**: `camelCase` (e.g., `generateMetadata`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Variables**: `camelCase` (e.g., `protocolName`)

## Testing

### Writing Tests

- Use Jest for all tests
- Test files should end with `.test.js` or `.test.mjs`
- Mock external dependencies
- Test both success and error cases

### Running Tests

```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage
npm run test:watch          # Watch mode
```

## Pull Request Guidelines

### PR Title Format

```
type(scope): description

Examples:
feat(cli): add --dry-run option to validate command
fix(validation): resolve schema validation error
docs: update README with new examples
```

### PR Description

- **What**: Clear description of changes
- **Why**: Rationale for the changes
- **How**: Technical implementation details
- **Testing**: How changes were verified

## Release Process

### Versioning

- Follow [semantic versioning](https://semver.org/)
- Release notes generated automatically

### Publishing

```bash
npm version patch  # or minor/major
npm publish
```

## Getting Help

- **Documentation**: Check `docs/` and README
- **Issues**: Search or create GitHub issues
- **Discussions**: GitHub Discussions for questions

Thank you for contributing!
