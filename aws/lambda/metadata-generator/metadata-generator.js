// Simplified metadata generator for Lambda
// This is a subset of the full metadata-generator.mjs adapted for Lambda

const METADATA_TEMPLATES = {
  defi: {
    amm: {
      protocol: {
        name: "{{protocol}} V{{version}}",
        version: "{{version}}",
        category: "automated-market-maker",
        description: "{{protocol}} automated market maker protocol",
        ecosystem: "ethereum",
        launchDate: "{{launchDate}}",
        feeTiers: [500, 3000, 10000],
        supportedNetworks: ["mainnet", "polygon", "arbitrum", "optimism"]
      },
      contract: {
        type: "{{contractType}}",
        interfaces: [],
        deploymentBlock: "{{deploymentBlock}}",
        auditReports: [],
        security: {
          audits: [],
          bugBounty: "{{bugBounty}}",
          insurance: "{{insurance}}"
        }
      }
    }
  },
  dao: {
    governor: {
      dao: {
        name: "{{daoName}}",
        mission: "{{mission}}",
        foundingDate: "{{foundingDate}}",
        memberCount: "{{memberCount}}",
        activeProposals: "{{activeProposals}}",
        treasuryValue: "{{treasuryValue}}"
      }
    }
  }
};

function deepMerge(target, source) {
  const result = { ...target };

  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });

  return result;
}

function interpolateTemplate(template, variables) {
  const result = JSON.parse(JSON.stringify(template));

  function processObject(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        Object.keys(variables).forEach(varName => {
          const placeholder = `{{${varName}}}`;
          obj[key] = obj[key].replace(new RegExp(placeholder, 'g'), variables[varName]);
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }
    });
  }

  processObject(result);
  return result;
}

function generateMetadata(category, type, variables = {}) {
  const template = METADATA_TEMPLATES[category]?.[type];

  if (!template) {
    throw new Error(`Template not found for category: ${category}, type: ${type}`);
  }

  const defaultVariables = {
    protocol: "ProtocolName",
    version: "1.0.0",
    contractType: type,
    deploymentBlock: "0",
    launchDate: new Date().toISOString().split('T')[0],
    ...variables
  };

  return interpolateTemplate(template, defaultVariables);
}

module.exports = {
  generateMetadata,
  METADATA_TEMPLATES
};


