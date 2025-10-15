import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ENSNamingWizard from '../bin/ens-naming.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ENS Naming CLI', () => {
  let wizard;

  beforeEach(() => {
    wizard = new ENSNamingWizard();
  });

  test('should generate canonical ID', () => {
    const answers = {
      org: 'uniswap',
      protocol: 'uniswap',
      category: 'defi',
      subcategory: 'amm',
      role: 'router',
      version: 'v1-0-0',
      chainId: 1,
      variant: null,
      ensRoot: 'uniswap.defi.cns.eth',
    };

    const suggestions = wizard.generateSubdomainSuggestions(answers);

    expect(suggestions.canonicalId).toBe('uniswap.uniswap.defi.router.v1-0-0.1');
  });

  test('should generate DeFi AMM subdomain suggestions', () => {
    const answers = {
      org: 'uniswap',
      protocol: 'uniswap',
      category: 'defi',
      subcategory: 'amm',
      role: 'router',
      version: 'v1-0-0',
      chainId: 1,
      variant: null,
      ensRoot: 'uniswap.defi.cns.eth',
    };

    const suggestions = wizard.generateSubdomainSuggestions(answers);

    expect(suggestions.suggestions).toHaveLength(4);
    expect(suggestions.suggestions[0].label).toBe('router');
    expect(suggestions.suggestions[0].fullDomain).toBe('router.uniswap.defi.cns.eth');
  });

  test('should generate DAO subdomain suggestions', () => {
    const answers = {
      org: 'ens',
      protocol: 'ens',
      category: 'dao',
      subcategory: null,
      role: 'governor',
      version: 'v1-0-0',
      chainId: 1,
      variant: null,
      ensRoot: 'ens.dao.cns.eth',
    };

    const suggestions = wizard.generateSubdomainSuggestions(answers);

    expect(suggestions.suggestions).toHaveLength(4);
    expect(suggestions.suggestions[0].label).toBe('governor');
    expect(suggestions.suggestions[0].fullDomain).toBe('governor.ens.dao.cns.eth');
  });

  test('should generate metadata with subdomains', () => {
    const answers = {
      org: 'uniswap',
      protocol: 'uniswap',
      category: 'defi',
      subcategory: 'amm',
      role: 'router',
      version: 'v1-0-0',
      chainId: 1,
      variant: null,
      ensRoot: 'uniswap.defi.cns.eth',
    };

    const suggestions = wizard.generateSubdomainSuggestions(answers);
    const metadata = wizard.generateMetadata(answers, suggestions);

    expect(metadata.id).toBe('uniswap.uniswap.defi.router.v1-0-0.1');
    expect(metadata.category).toBe('defi');
    expect(metadata.subcategory).toBe('amm');
    expect(metadata.ensRoot).toBe('uniswap.defi.cns.eth');
    expect(metadata.subdomains).toHaveLength(4);
    expect(metadata.subdomains[0].label).toBe('router');
  });

  test('should handle variant in canonical ID', () => {
    const answers = {
      org: 'uniswap',
      protocol: 'uniswap',
      category: 'defi',
      subcategory: 'amm',
      role: 'router',
      version: 'v1-0-0',
      chainId: 1,
      variant: 'v3',
      ensRoot: 'uniswap.defi.cns.eth',
    };

    const suggestions = wizard.generateSubdomainSuggestions(answers);

    expect(suggestions.canonicalId).toBe('uniswap.uniswap.defi.router.v3.v1-0-0.1');
  });
});
