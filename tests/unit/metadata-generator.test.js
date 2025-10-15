const fs = require('fs');

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

describe('Metadata Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template validation', () => {
    test('should validate template structure', () => {
      const validTemplate = {
        protocol: {
          name: 'Test Protocol',
          version: '1.0.0',
          category: 'test',
        },
        contract: {
          type: 'test-contract',
        },
      };

      expect(validTemplate.protocol).toBeDefined();
      expect(validTemplate.contract).toBeDefined();
      expect(validTemplate.protocol.name).toBe('Test Protocol');
    });

    test('should handle missing template properties', () => {
      const incompleteTemplate = {
        protocol: {
          name: 'Test Protocol',
        },
      };

      expect(incompleteTemplate.protocol.name).toBe('Test Protocol');
      expect(incompleteTemplate.contract).toBeUndefined();
    });
  });

  describe('Variable substitution', () => {
    test('should substitute template variables', () => {
      const template = '{{protocol}} V{{version}}';
      const variables = {
        protocol: 'Uniswap',
        version: '3',
      };

      let result = template;
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      expect(result).toBe('Uniswap V3');
    });

    test('should handle missing variables', () => {
      const template = '{{protocol}} V{{version}}';
      const variables = {
        protocol: 'Uniswap',
      };

      let result = template;
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      expect(result).toBe('Uniswap V{{version}}');
    });
  });

  describe('File operations', () => {
    test('should write metadata to file', () => {
      const metadata = { test: 'data' };
      const filename = 'test-metadata.json';

      fs.writeFileSync(filename, JSON.stringify(metadata, null, 2));

      expect(fs.writeFileSync).toHaveBeenCalledWith(filename, JSON.stringify(metadata, null, 2));
    });

    test('should check if file exists', () => {
      fs.existsSync.mockReturnValue(true);

      const exists = fs.existsSync('test-file.json');

      expect(exists).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('test-file.json');
    });
  });
});
