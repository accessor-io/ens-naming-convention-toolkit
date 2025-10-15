#!/bin/bash

# ENS Metadata Tools - Comprehensive Error Checker
# This script runs through all commands and finds errors in the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error tracking
ERRORS=0
WARNINGS=0
TOTAL_TESTS=0

# Function to log results
log_result() {
    local status=$1
    local message=$2
    local details=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "ERROR" ]; then
        echo -e "${RED}ERROR:${NC} $message"
        if [ -n "$details" ]; then
            echo -e "${RED}   Details: $details${NC}"
        fi
        ERRORS=$((ERRORS + 1))
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}WARNING:${NC} $message"
        if [ -n "$details" ]; then
            echo -e "${YELLOW}   Details: $details${NC}"
        fi
        WARNINGS=$((WARNINGS + 1))
    elif [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}SUCCESS:${NC} $message"
    else
        echo -e "${BLUE}INFO:${NC} $message"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command and capture errors
run_command() {
    local cmd="$1"
    local description="$2"
    local expected_exit_code=${3:-0}
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "${BLUE}Command: $cmd${NC}"
    
    if eval "$cmd" >/dev/null 2>&1; then
        local exit_code=$?
        if [ $exit_code -eq $expected_exit_code ]; then
            log_result "SUCCESS" "$description"
        else
            log_result "WARNING" "$description" "Exit code: $exit_code (expected: $expected_exit_code)"
        fi
    else
        local exit_code=$?
        log_result "ERROR" "$description" "Exit code: $exit_code"
    fi
    echo ""
}

# Function to check file syntax
check_syntax() {
    local file="$1"
    local description="$2"
    
    if [ ! -f "$file" ]; then
        log_result "ERROR" "$description" "File not found: $file"
        return
    fi
    
    case "${file##*.}" in
        "js"|"mjs")
            if command_exists node; then
                if node --check "$file" >/dev/null 2>&1; then
                    log_result "SUCCESS" "$description"
                else
                    log_result "ERROR" "$description" "JavaScript syntax error"
                fi
            else
                log_result "WARNING" "$description" "Node.js not available for syntax check"
            fi
            ;;
        "ts")
            if command_exists tsc; then
                if tsc --noEmit "$file" >/dev/null 2>&1; then
                    log_result "SUCCESS" "$description"
                else
                    log_result "ERROR" "$description" "TypeScript compilation error"
                fi
            else
                log_result "WARNING" "$description" "TypeScript compiler not available"
            fi
            ;;
        "sh")
            if bash -n "$file" >/dev/null 2>&1; then
                log_result "SUCCESS" "$description"
            else
                log_result "ERROR" "$description" "Bash syntax error"
            fi
            ;;
        "json")
            if command_exists node; then
                if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" >/dev/null 2>&1; then
                    log_result "SUCCESS" "$description"
                else
                    log_result "ERROR" "$description" "JSON syntax error"
                fi
            else
                log_result "WARNING" "$description" "Node.js not available for JSON validation"
            fi
            ;;
        *)
            log_result "INFO" "$description" "File type not checked"
            ;;
    esac
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ENS Metadata Tools - Error Checker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking Prerequisites...${NC}"
if command_exists node; then
    log_result "SUCCESS" "Node.js is available" "Version: $(node --version)"
else
    log_result "ERROR" "Node.js is not installed"
fi

if command_exists npm; then
    log_result "SUCCESS" "npm is available" "Version: $(npm --version)"
else
    log_result "ERROR" "npm is not installed"
fi

if command_exists aws; then
    log_result "SUCCESS" "AWS CLI is available" "Version: $(aws --version 2>&1 | head -n1)"
else
    log_result "WARNING" "AWS CLI is not installed"
fi

if command_exists cdk; then
    log_result "SUCCESS" "AWS CDK is available" "Version: $(cdk --version)"
else
    log_result "WARNING" "AWS CDK is not installed"
fi

echo ""

# Check package.json and dependencies
echo -e "${YELLOW}Checking Package Configuration...${NC}"
if [ -f "package.json" ]; then
    log_result "SUCCESS" "package.json exists"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        log_result "SUCCESS" "node_modules directory exists"
    else
        log_result "WARNING" "node_modules directory missing" "Run 'npm install' to install dependencies"
    fi
    
    # Check for package-lock.json
    if [ -f "package-lock.json" ]; then
        log_result "SUCCESS" "package-lock.json exists"
    else
        log_result "WARNING" "package-lock.json missing" "Dependencies may not be locked"
    fi
else
    log_result "ERROR" "package.json not found"
fi

echo ""

# Check main project files syntax
echo -e "${YELLOW}Checking Main Project Files...${NC}"
check_syntax "index.mjs" "Main entry point (index.mjs)"
check_syntax "index.js" "Alternative entry point (index.js)"
check_syntax "package.json" "Package configuration"

echo ""

# Check bin directory files
echo -e "${YELLOW}Checking Binary Commands...${NC}"
for file in bin/*.js bin/*.mjs; do
    if [ -f "$file" ]; then
        check_syntax "$file" "Binary command: $(basename "$file")"
    fi
done

echo ""

# Check prober directory files
echo -e "${YELLOW}Checking Prober Scripts...${NC}"
for file in prober/*.js; do
    if [ -f "$file" ]; then
        check_syntax "$file" "Prober script: $(basename "$file")"
    fi
done

echo ""

# Check examples
echo -e "${YELLOW}Checking Examples...${NC}"
for file in examples/*.js; do
    if [ -f "$file" ]; then
        check_syntax "$file" "Example: $(basename "$file")"
    fi
done

echo ""

# Check AWS CDK files
echo -e "${YELLOW}Checking AWS CDK Files...${NC}"
if [ -d "aws/cdk" ]; then
    check_syntax "aws/cdk/package.json" "CDK package.json"
    check_syntax "aws/cdk/cdk.json" "CDK configuration"
    check_syntax "aws/cdk/tsconfig.json" "TypeScript configuration"
    
    for file in aws/cdk/bin/*.ts aws/cdk/lib/*.ts; do
        if [ -f "$file" ]; then
            check_syntax "$file" "CDK file: $(basename "$file")"
        fi
    done
else
    log_result "WARNING" "AWS CDK directory not found"
fi

echo ""

# Check AWS Lambda functions
echo -e "${YELLOW}Checking AWS Lambda Functions...${NC}"
if [ -d "aws/lambda" ]; then
    for dir in aws/lambda/*/; do
        if [ -d "$dir" ]; then
            function_name=$(basename "$dir")
            if [ -f "$dir/index.js" ]; then
                check_syntax "$dir/index.js" "Lambda function: $function_name"
            else
                log_result "WARNING" "Lambda function: $function_name" "No index.js found"
            fi
            
            if [ -f "$dir/package.json" ]; then
                check_syntax "$dir/package.json" "Lambda package.json: $function_name"
            fi
        fi
    done
else
    log_result "WARNING" "AWS Lambda directory not found"
fi

echo ""

# Check AWS scripts
echo -e "${YELLOW}Checking AWS Scripts...${NC}"
for file in aws/scripts/*.sh; do
    if [ -f "$file" ]; then
        check_syntax "$file" "AWS script: $(basename "$file")"
    fi
done

echo ""

# Check Hardhat configuration
echo -e "${YELLOW}Checking Hardhat Configuration...${NC}"
if [ -f "hardhat.config.js" ]; then
    check_syntax "hardhat.config.js" "Hardhat configuration"
else
    log_result "WARNING" "Hardhat configuration not found"
fi

# Check contracts
if [ -d "contracts" ]; then
    for file in contracts/*.sol; do
        if [ -f "$file" ]; then
            log_result "INFO" "Solidity contract: $(basename "$file")" "Syntax check not implemented for Solidity"
        fi
    done
else
    log_result "WARNING" "Contracts directory not found"
fi

echo ""

# Test npm scripts (if node_modules exists)
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Testing NPM Scripts...${NC}"
    
    # Test scripts that should work
    run_command "npm run start --help" "Start script help" 0
    run_command "npm run metadata --help" "Metadata generator help" 0
    run_command "npm run validate --help" "Validator help" 0
    run_command "npm run probe --help" "Prober help" 0
    run_command "npm run lookup --help" "Lookup help" 0
    run_command "npm run plan --help" "Subdomain planner help" 0
    run_command "npm run security --help" "Security analyzer help" 0
    
    # Test example script
    run_command "npm run example" "Example script execution" 0
else
    log_result "WARNING" "Skipping NPM script tests" "node_modules not found"
fi

echo ""

# Test binary commands (if node_modules exists)
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Testing Binary Commands...${NC}"
    
    # Test CLI commands
    run_command "node bin/cli.mjs --help" "Main CLI help" 0
    run_command "node bin/contract-naming-cli.js --help" "Contract naming CLI help" 0
    run_command "node bin/naming-validator.js --help" "Naming validator help" 0
    run_command "node bin/security-analyzer.js --help" "Security analyzer help" 0
    run_command "node bin/subdomain-planner.mjs --help" "Subdomain planner help" 0
    run_command "node bin/metadata-generator.mjs --help" "Metadata generator help" 0
    
    # Test prober commands
    run_command "node prober/lookup-resolver-names.js --help" "Lookup resolver help" 0
    run_command "node prober/lookup-resolver-names.js check-resolvers 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" "Check resolvers sample" 0
    run_command "node prober/enhanced-contract-resolver.js --help" "Enhanced contract resolver help" 0
else
    log_result "WARNING" "Skipping binary command tests" "node_modules not found"
fi

echo ""

# Test AWS CDK (if available)
if command_exists cdk && [ -d "aws/cdk" ]; then
    echo -e "${YELLOW}Testing AWS CDK...${NC}"
    
    cd aws/cdk
    run_command "cdk synth --quiet" "CDK synthesis" 0
    run_command "cdk list" "CDK stack listing" 0
    cd ../..
else
    log_result "WARNING" "Skipping AWS CDK tests" "CDK not available or directory not found"
fi

echo ""

# Test Hardhat (if available)
if command_exists npx && [ -f "hardhat.config.js" ]; then
    echo -e "${YELLOW}Testing Hardhat...${NC}"
    
    run_command "npx hardhat compile --force" "Hardhat compilation" 0
    run_command "npx hardhat test" "Hardhat tests" 0
else
    log_result "WARNING" "Skipping Hardhat tests" "Hardhat not available or config not found"
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Error Check Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo -e "Successes: ${GREEN}$((TOTAL_TESTS - ERRORS - WARNINGS))${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}No errors found! Project is ready to use.${NC}"
    exit 0
else
    echo -e "\n${RED}Found $ERRORS error(s). Please fix them before proceeding.${NC}"
    exit 1
fi
