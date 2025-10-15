#!/bin/bash

# ENS Naming CLI Options Test Script
# This script demonstrates all available CLI options and commands

echo "=========================================="
echo "ENS Naming CLI Options Demonstration"
echo "=========================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js to run this script."
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

# Function to run command and show output
run_command() {
    local description="$1"
    local command="$2"
    
    echo "[INFO] $description"
    echo "Command: $command"
    echo "---"
    eval "$command" 2>&1 | head -20
    echo "---"
    echo ""
}

# 1. Help and general information
echo "HELP AND GENERAL INFORMATION"
echo "=================================="

run_command "Main CLI help" "node bin/ens-naming.mjs --help"
run_command "Main CLI version" "node bin/ens-naming.mjs --version"

# 2. Wizard command
echo "WIZARD COMMAND"
echo "=================="

run_command "Wizard help" "node bin/ens-naming.mjs wizard --help"
run_command "Wizard dry run" "echo 'ens\nens\ndao\ngovernor\nv1-0-0\n1\n\nens.dao.cns.eth' | node bin/ens-naming.mjs wizard --dry-run"

# 3. Suggest command
echo "SUGGEST COMMAND"
echo "==================="

run_command "Suggest help" "node bin/ens-naming.mjs suggest --help"
run_command "Suggest for DAO category" "node bin/ens-naming.mjs suggest ens dao"
run_command "Suggest for DeFi AMM subcategory" "node bin/ens-naming.mjs suggest uniswap defi --subcategory amm"
run_command "Suggest with verbose output" "node bin/ens-naming.mjs suggest maker defi --verbose"

# 4. Validate-name command
echo "VALIDATE-NAME COMMAND"
echo "========================="

run_command "Validate-name help" "node bin/ens-naming.mjs validate-name --help"
run_command "Validate simple domain" "node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao"
run_command "Validate with strict mode" "node bin/ens-naming.mjs validate-name router.uniswap.defi.cns.eth defi --strict"
run_command "Validate with metadata file" "node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao --metadata metadata/protocols/ens-dao-governor-plan.json"

# 5. Generate-metadata command
echo "GENERATE-METADATA COMMAND"
echo "=============================="

run_command "Generate-metadata help" "node bin/ens-naming.mjs generate-metadata --help"
run_command "Generate metadata for DAO" "node bin/ens-naming.mjs generate-metadata ens ens dao governor v1-0-0 1"
run_command "Generate metadata with variant" "node bin/ens-naming.mjs generate-metadata uniswap uniswap defi router v2-0-0 1 --variant v2"

# 6. Register command
echo "REGISTER COMMAND"
echo "===================="

run_command "Register help" "node bin/ens-naming.mjs register --help"
run_command "Register with dry run" "node bin/ens-naming.mjs register metadata/protocols/ens-dao-governor-plan.json --dry-run"
run_command "Register with output file" "node bin/ens-naming.mjs register metadata/protocols/ens-dao-governor-plan.json -o test-register.sh --dry-run"

# 7. QA Report command
echo "QA-REPORT COMMAND"
echo "====================="

run_command "QA-report help" "node bin/ens-naming.mjs qa-report --help"
run_command "QA report for single file" "node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json"
run_command "QA report for directory" "node bin/ens-naming.mjs qa-report metadata/protocols/"
run_command "QA report with markdown format" "node bin/ens-naming.mjs qa-report metadata/protocols/ --format markdown"
run_command "QA report with JSON output" "node bin/ens-naming.mjs qa-report metadata/protocols/ --format json"

# 8. Migrate command
echo "MIGRATE COMMAND"
echo "==================="

run_command "Migrate help" "node bin/ens-naming.mjs migrate --help"
run_command "Migrate with dry run" "node bin/ens-naming.mjs migrate metadata/protocols/ --dry-run"
run_command "Migrate single file" "node bin/ens-naming.mjs migrate metadata/protocols/ens-dao-governor-plan.json --dry-run"
run_command "Migrate with in-place flag" "node bin/ens-naming.mjs migrate metadata/protocols/ens-dao-governor-plan.json --in-place --dry-run"

# 9. Check command
echo "CHECK COMMAND"
echo "================="

run_command "Check help" "node bin/ens-naming.mjs check --help"
run_command "Check single file" "node bin/ens-naming.mjs check metadata/protocols/ens-dao-governor-plan.json"
run_command "Check with strict mode" "node bin/ens-naming.mjs check metadata/protocols/ens-dao-governor-plan.json --strict"
run_command "Check directory" "node bin/ens-naming.mjs check metadata/protocols/"

# 10. Categories command
echo "CATEGORIES COMMAND"
echo "====================="

run_command "Categories help" "node bin/ens-naming.mjs categories --help"
run_command "List all categories" "node bin/ens-naming.mjs categories"
run_command "List categories with subcategories" "node bin/ens-naming.mjs categories --subcategories"

# 11. Backward compatibility commands
echo "BACKWARD COMPATIBILITY"
echo "=========================="

run_command "Old CLI deprecation warning" "node bin/contract-naming-cli.js"
run_command "Old CLI categories command" "node bin/contract-naming-cli.js categories"

# 12. Error handling examples
echo "ERROR HANDLING EXAMPLES"
echo "==========================="

run_command "Invalid command" "node bin/ens-naming.mjs invalid-command"
run_command "Missing required arguments" "node bin/ens-naming.mjs validate-name"
run_command "Invalid domain format" "node bin/ens-naming.mjs validate-name invalid-domain dao"
run_command "Non-existent file" "node bin/ens-naming.mjs check non-existent-file.json"

# 13. Advanced usage examples
echo "ADVANCED USAGE EXAMPLES"
echo "==========================="

run_command "Chain multiple commands" "node bin/ens-naming.mjs suggest ens dao && node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao"
run_command "Use with environment variables" "ENS_ROOT=ens.dao.cns.eth node bin/ens-naming.mjs suggest ens dao"
run_command "Pipe output to file" "node bin/ens-naming.mjs qa-report metadata/protocols/ --format json > qa-report.json"

# 14. Proxy contract examples
echo "PROXY CONTRACT EXAMPLES"
echo "==========================="

run_command "Validate proxy domain" "node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao --metadata metadata/protocols/ens-dao-governor-plan.json"
run_command "Check proxy consistency" "node bin/ens-naming.mjs check metadata/protocols/ens-dao-governor-plan.json --strict"

# 15. Schema validation examples
echo "SCHEMA VALIDATION EXAMPLES"
echo "=============================="

run_command "Validate schema file" "node bin/schema-validator.mjs metadata/protocols/ens-dao-governor-plan.json"
run_command "Validate multiple files" "node bin/schema-validator.mjs metadata/protocols/*.json"

# 16. Cross-reference validation
echo "CROSS-REFERENCE VALIDATION"
echo "==============================="

run_command "Cross-reference validation" "node bin/cross-reference-validator.mjs metadata/protocols/ens-dao-governor-plan.json"
run_command "Cross-reference batch" "node bin/cross-reference-validator.mjs metadata/protocols/"

# 17. Security analysis
echo "SECURITY ANALYSIS"
echo "===================="

run_command "Security analysis" "node bin/security-analyzer.mjs metadata/protocols/ens-dao-governor-plan.json"
run_command "Security analysis with verbose output" "node bin/security-analyzer.mjs metadata/protocols/ens-dao-governor-plan.json --verbose"

# 18. Subdomain planning
echo "SUBDOMAIN PLANNING"
echo "======================"

run_command "Subdomain planning" "node bin/subdomain-planner.mjs metadata/protocols/ens-dao-governor-plan.json"
run_command "Subdomain planning with output" "node bin/subdomain-planner.mjs metadata/protocols/ens-dao-governor-plan.json -o subdomain-plan.json"

# 19. Metadata generation
echo "METADATA GENERATION"
echo "======================="

run_command "Metadata generation" "node bin/metadata-generator.mjs --help"
run_command "Generate metadata for DAO" "node bin/metadata-generator.mjs --category dao --protocol ens --role governor"

# 20. Cache browser
echo "CACHE BROWSER"
echo "=================="

run_command "Cache browser help" "node bin/cache-browser.mjs --help"
run_command "Cache browser list" "node bin/cache-browser.mjs list"

# 21. Contract discovery
echo "CONTRACT DISCOVERY"
echo "======================"

run_command "Contract discovery" "node bin/contract-discovery.mjs --help"
run_command "Contract discovery for address" "node bin/contract-discovery.mjs 0x1234567890123456789012345678901234567890"

# 22. ENS operations
echo "ENS OPERATIONS"
echo "=================="

run_command "ENS operations help" "node bin/ens-operations.mjs --help"
run_command "ENS operations test" "node bin/ens-operations.mjs test"

# 23. EVM debugger
echo "EVM DEBUGGER"
echo "================="

run_command "EVM debugger help" "node bin/evmd.js --help"
run_command "EVM debugger version" "node bin/evmd.js --version"

# 24. Metadata filler
echo "METADATA FILLER"
echo "==================="

run_command "Metadata filler help" "node bin/metadata-filler.mjs --help"
run_command "Metadata filler for file" "node bin/metadata-filler.mjs metadata/protocols/ens-dao-governor-plan.json"

# 25. QA report generator
echo "QA REPORT GENERATOR"
echo "========================"

run_command "QA report generator help" "node bin/qa-report-generator.mjs --help"
run_command "QA report generator for file" "node bin/qa-report-generator.mjs metadata/protocols/ens-dao-governor-plan.json"

# 26. Naming validator
echo "NAMING VALIDATOR"
echo "===================="

run_command "Naming validator help" "node bin/naming-validator.mjs --help"
run_command "Naming validator for domain" "node bin/naming-validator.mjs governor.ens.dao.cns.eth dao"

# 27. Schema validator
echo "📋 SCHEMA VALIDATOR"
echo "===================="

run_command "Schema validator help" "node bin/schema-validator.mjs --help"
run_command "Schema validator for file" "node bin/schema-validator.mjs metadata/protocols/ens-dao-governor-plan.json"

# 28. Cross-reference validator
echo "🔗 CROSS-REFERENCE VALIDATOR"
echo "=============================="

run_command "Cross-reference validator help" "node bin/cross-reference-validator.mjs --help"
run_command "Cross-reference validator for file" "node bin/cross-reference-validator.mjs metadata/protocols/ens-dao-governor-plan.json"

# 29. Security analyzer
echo "SECURITY ANALYZER"
echo "===================="

run_command "Security analyzer help" "node bin/security-analyzer.mjs --help"
run_command "Security analyzer for file" "node bin/security-analyzer.mjs metadata/protocols/ens-dao-governor-plan.json"

# 30. Subdomain planner
echo "SUBDOMAIN PLANNER"
echo "======================"

run_command "Subdomain planner help" "node bin/subdomain-planner.mjs --help"
run_command "Subdomain planner for file" "node bin/subdomain-planner.mjs metadata/protocols/ens-dao-governor-plan.json"

# 31. Contract naming CLI (deprecated)
echo "CONTRACT NAMING CLI (DEPRECATED)"
echo "====================================="

run_command "Contract naming CLI help" "node bin/contract-naming-cli.js --help"
run_command "Contract naming CLI categories" "node bin/contract-naming-cli.js categories"

# 32. Migration tool
echo "🔄 MIGRATION TOOL"
echo "==================="

run_command "Migration tool help" "node bin/migrate-schema.mjs --help"
run_command "Migration tool dry run" "node bin/migrate-schema.mjs metadata/protocols/ --dry-run"

# 33. Prober tools
echo "PROBER TOOLS"
echo "================="

run_command "Contract discovery prober" "node tools/prober/contract-discovery.js --help"
run_command "Lookup resolver names" "node tools/prober/lookup-resolver-names.js --help"
run_command "Probe multicall" "node tools/prober/probe-multicall.js --help"

# 34. Scripts
echo "📜 SCRIPTS"
echo "============"

run_command "Analyze resolvers script" "node scripts/analyze-resolvers.cjs --help"
run_command "Get real resolvers script" "node scripts/get-real-resolvers.cjs --help"
run_command "Query ENS resolvers script" "node scripts/query-ens-resolvers.cjs --help"
run_command "Update domains script" "node scripts/update-domains.js --help"

# 35. Error checker script
echo "ERROR CHECKER SCRIPT"
echo "========================="

run_command "Error checker script" "bash scripts/error-checker.sh"

# 36. Deployment script
echo "DEPLOYMENT SCRIPT"
echo "====================="

run_command "Deployment script" "node scripts/deployment/deploy.js --help"

# 37. Download resolver source script
echo "DOWNLOAD RESOLVER SOURCE SCRIPT"
echo "===================================="

run_command "Download resolver source script" "node scripts/download-resolver-source.cjs --help"

# 38. Test commands
echo "TEST COMMANDS"
echo "=================="

run_command "Run all tests" "npm test"
run_command "Run specific test" "npm test -- test/ens-naming.test.js"
run_command "Run tests with coverage" "npm run test:coverage"
run_command "Run tests in watch mode" "npm run test:watch"

# 39. Linting and formatting
echo "LINTING AND FORMATTING"
echo "=========================="

run_command "Run linter" "npm run lint"
run_command "Type check" "npm run typecheck"

# 40. Package management
echo "PACKAGE MANAGEMENT"
echo "======================"

run_command "Install dependencies" "npm install"
run_command "Update dependencies" "npm update"
run_command "Check for outdated packages" "npm outdated"

# 41. Documentation
echo "DOCUMENTATION"
echo "=================="

run_command "View README" "cat README.md"
run_command "View CHANGELOG" "cat CHANGELOG.md"
run_command "View CONTRIBUTING" "cat CONTRIBUTING.md"
run_command "View SECURITY" "cat SECURITY.md"
run_command "View SUPPORT" "cat SUPPORT.md"

# 42. Configuration files
echo "CONFIGURATION FILES"
echo "======================="

run_command "View package.json" "cat package.json"
run_command "View jest.config.cjs" "cat jest.config.cjs"
run_command "View schema.json" "cat data/metadata/schema.json"
run_command "View QA validation rules" "cat data/configs/qa-validation-rules.json"

# 43. Data files
echo "DATA FILES"
echo "=============="

run_command "View category registry" "cat docs/category-registry.json"
run_command "View root domains" "cat docs/root-domains.json"
run_command "List metadata files" "ls -la metadata/protocols/"
run_command "List analysis data" "ls -la data/analysis/"

# 44. Environment and system info
echo "ENVIRONMENT AND SYSTEM INFO"
echo "==============================="

run_command "Node.js version" "node --version"
run_command "NPM version" "npm --version"
run_command "System info" "uname -a"
run_command "Current directory" "pwd"
run_command "Directory contents" "ls -la"

# 45. Git information
echo "GIT INFORMATION"
echo "===================="

run_command "Git status" "git status"
run_command "Git log (last 5 commits)" "git log --oneline -5"
run_command "Git branches" "git branch -a"
run_command "Git tags" "git tag"

# 46. Performance testing
echo "PERFORMANCE TESTING"
echo "======================="

run_command "Test CLI performance" "time node bin/ens-naming.mjs suggest ens dao"
run_command "Test validation performance" "time node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao"
run_command "Test QA report performance" "time node bin/ens-naming.mjs qa-report metadata/protocols/"

# 47. Integration testing
echo "INTEGRATION TESTING"
echo "======================="

run_command "Test wizard to validation pipeline" "echo 'ens\nens\ndao\ngovernor\nv1-0-0\n1\n\nens.dao.cns.eth' | node bin/ens-naming.mjs wizard --dry-run | head -20"
run_command "Test suggest to validate pipeline" "node bin/ens-naming.mjs suggest ens dao | head -5 && node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao"

# 48. Error recovery testing
echo "ERROR RECOVERY TESTING"
echo "=========================="

run_command "Test invalid input handling" "echo 'invalid\ninput' | node bin/ens-naming.mjs wizard --dry-run"
run_command "Test missing file handling" "node bin/ens-naming.mjs check non-existent-file.json"
run_command "Test malformed JSON handling" "echo 'invalid json' > /tmp/invalid.json && node bin/ens-naming.mjs check /tmp/invalid.json"

# 49. Output format testing
echo "OUTPUT FORMAT TESTING"
echo "========================="

run_command "Test JSON output" "node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format json"
run_command "Test Markdown output" "node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format markdown"
run_command "Test text output" "node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format text"

# 50. Final summary
echo "FINAL SUMMARY"
echo "================="

echo "CLI Options Demonstration Complete!"
echo ""
echo "Summary of available commands:"
echo "  • Main CLI: bin/ens-naming.mjs (unified entry point)"
echo "  • Wizard: Interactive contract naming workflow"
echo "  • Suggest: Generate subdomain suggestions"
echo "  • Validate-name: Validate domain names"
echo "  • Generate-metadata: Create metadata files"
echo "  • Register: Generate ENS registration scripts"
echo "  • QA-report: Generate quality assurance reports"
echo "  • Migrate: Migrate old schema to new schema"
echo "  • Check: Validate metadata files"
echo "  • Categories: List available categories"
echo ""
echo "Additional tools:"
echo "  • Schema validator"
echo "  • Cross-reference validator"
echo "  • Security analyzer"
echo "  • Subdomain planner"
echo "  • Migration tool"
echo "  • Prober tools"
echo ""
echo "Documentation:"
echo "  • README.md: Main documentation"
echo "  • docs/: Detailed documentation"
echo "  • PROXY-CONTRACT-HANDLING.md: Proxy handling guide"
echo ""
echo "Testing:"
echo "  • npm test: Run all tests"
echo "  • npm run test:coverage: Run tests with coverage"
echo "  • npm run test:watch: Run tests in watch mode"
echo ""
echo "Ready to use! Start with: node bin/ens-naming.mjs wizard"
