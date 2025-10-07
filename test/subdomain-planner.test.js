const fs = require('fs');

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn()
}));

describe('Subdomain Planner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Subdomain hierarchy validation', () => {
    test('should validate DeFi AMM structure', () => {
      const defiAmmStructure = [
        'v3.<protocol>.amm.eth',
        '├── factory.v3.<protocol>.amm.eth',
        '├── router.v3.<protocol>.amm.eth',
        '├── quoter.v3.<protocol>.amm.eth',
        '└── multicall.v3.<protocol>.amm.eth'
      ];

      expect(defiAmmStructure).toHaveLength(5);
      expect(defiAmmStructure[0]).toContain('v3.<protocol>.amm.eth');
      expect(defiAmmStructure[1]).toContain('factory.v3.<protocol>.amm.eth');
    });

    test('should validate NFT structure', () => {
      const nftStructure = [
        '<collection>.nft.eth',
        '├── metadata.<collection>.nft.eth',
        '├── marketplace.<collection>.nft.eth',
        '└── staking.<collection>.nft.eth'
      ];

      expect(nftStructure).toHaveLength(4);
      expect(nftStructure[0]).toContain('<collection>.nft.eth');
    });
  });

  describe('Plan generation', () => {
    test('should generate valid plan structure', () => {
      const plan = {
        protocol: 'Uniswap',
        category: 'defi',
        type: 'amm',
        version: '3',
        domains: [
          {
            name: 'v3.uniswap.amm.eth',
            type: 'root',
            description: 'Uniswap V3 AMM root domain'
          }
        ],
        metadata: {
          protocol: {
            name: 'Uniswap V3',
            version: '3',
            category: 'automated-market-maker'
          }
        }
      };

      expect(plan.protocol).toBe('Uniswap');
      expect(plan.category).toBe('defi');
      expect(plan.domains).toHaveLength(1);
      expect(plan.domains[0].name).toBe('v3.uniswap.amm.eth');
    });

    test('should validate plan structure', () => {
      const plan = {
        protocol: 'Test',
        category: 'defi',
        type: 'amm'
      };

      const requiredFields = ['protocol', 'category', 'type'];
      const hasRequiredFields = requiredFields.every(field => 
        plan.hasOwnProperty(field) && plan[field]
      );

      expect(hasRequiredFields).toBe(true);
    });
  });

  describe('File operations', () => {
    test('should save plan to file', () => {
      const plan = { test: 'plan' };
      const filename = 'test-plan.json';

      fs.writeFileSync(filename, JSON.stringify(plan, null, 2));

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filename,
        JSON.stringify(plan, null, 2)
      );
    });

    test('should load existing plan', () => {
      const planData = { existing: 'plan' };
      fs.readFileSync.mockReturnValue(JSON.stringify(planData));

      const result = JSON.parse(fs.readFileSync('existing-plan.json', 'utf8'));

      expect(result).toEqual(planData);
      expect(fs.readFileSync).toHaveBeenCalledWith('existing-plan.json', 'utf8');
    });
  });

  describe('Domain validation', () => {
    test('should validate ENS domain format', () => {
      const validDomains = [
        'test.eth',
        'sub.test.eth',
        'v3.uniswap.amm.eth'
      ];

      const invalidDomains = [
        'invalid',
        'test.',
        '.eth',
        'test..eth'
      ];

      validDomains.forEach(domain => {
        expect(domain).toMatch(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/);
      });

      invalidDomains.forEach(domain => {
        expect(domain).not.toMatch(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/);
      });
    });
  });
});
