const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

class ENSSecurityAnalyzer {
    async analyzeDomain(domain) {
        const issues = [];
        const recommendations = [];

        // Check domain structure
        if (domain.length > 253) {
            issues.push({
                severity: 'high',
                type: 'domain-length',
                message: 'Domain name exceeds maximum length of 253 characters'
            });
        }

        // Check for suspicious patterns
        if (domain.includes('..')) {
            issues.push({
                severity: 'critical',
                type: 'double-dots',
                message: 'Domain contains consecutive dots'
            });
        }

        // Check TLD
        const tld = domain.split('.').pop();
        if (!['eth', 'xyz', 'crypto', 'dao'].includes(tld)) {
            recommendations.push({
                type: 'tld-check',
                message: 'Consider using .eth TLD for ENS domains'
            });
        }

        // Check for homoglyph attacks
        const homoglyphs = {
            'rn': 'm',
            'cl': 'd',
            'vv': 'w',
            '0': 'o',
            '1': 'l'
        };

        for (const [pattern, replacement] of Object.entries(homoglyphs)) {
            if (domain.includes(pattern)) {
                issues.push({
                    severity: 'medium',
                    type: 'homoglyph-attack',
                    message: `Domain contains potential homoglyph: ${pattern} could be confused with ${replacement}`
                });
            }
        }

        return {
            domain,
            issues,
            recommendations,
            score: this.calculateSecurityScore(issues),
            timestamp: new Date().toISOString()
        };
    }

    calculateSecurityScore(issues) {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 30;
                    break;
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }

        return Math.max(0, score);
    }

    displayReport(results) {
        console.log(`\nSecurity Analysis Report for ${results.domain}`);
        console.log('═'.repeat(50));
        console.log(`Security Score: ${results.score}/100`);

        if (results.issues.length > 0) {
            console.log('\nIssues Found:');
            results.issues.forEach(issue => {
                const icon = issue.severity === 'critical' ? '[CRITICAL]' :
                           issue.severity === 'high' ? '[HIGH]' :
                           issue.severity === 'medium' ? '[MEDIUM]' : '[LOW]';
                console.log(`${icon} ${issue.severity.toUpperCase()}: ${issue.message}`);
            });
        }

        if (results.recommendations.length > 0) {
            console.log('\nRecommendations:');
            results.recommendations.forEach(rec => {
                console.log(`- ${rec.message}`);
            });
        }
    }
}

exports.handler = async (event) => {
    console.log('Security Analyzer Lambda invoked');

    try {
        const body = JSON.parse(event.body || '{}');
        const {
            domain,
            bucket = process.env.METADATA_BUCKET,
            table = process.env.METADATA_TABLE
        } = body;

        if (!domain) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                body: JSON.stringify({
                    error: 'Domain parameter is required'
                })
            };
        }

        const analyzer = new ENSSecurityAnalyzer();
        const results = await analyzer.analyzeDomain(domain);

        // Store results in DynamoDB
        if (table) {
            await dynamodb.put({
                TableName: table,
                Item: {
                    category: 'security-analysis',
                    name: domain,
                    type: 'security-report',
                    metadata: results,
                    createdAt: new Date().toISOString()
                }
            }).promise();
        }

        // Store results in S3
        if (bucket) {
            const key = `security-reports/${domain}/${Date.now()}.json`;
            await s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(results, null, 2),
                ContentType: 'application/json'
            }).promise();
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                success: true,
                results
            })
        };

    } catch (error) {
        console.error('Error in security analyzer:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
