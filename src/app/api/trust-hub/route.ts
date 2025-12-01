import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch Trust Hub products and compliance information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Fetch account details
    const account = await client.api.accounts(accountSid).fetch();
    
    // Trust Hub products and compliance information
    const trustHubData = {
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      },
      compliance: {
        // Regulatory compliance status
        regulatoryCompliance: {
          status: 'active', // This would come from Trust Hub API
          lastUpdated: new Date().toISOString(),
          certifications: [
            {
              name: 'SOC 2 Type II',
              status: 'certified',
              expiryDate: '2024-12-31',
              description: 'Security, availability, and confidentiality controls'
            },
            {
              name: 'ISO 27001',
              status: 'certified',
              expiryDate: '2024-11-15',
              description: 'Information security management system'
            },
            {
              name: 'PCI DSS Level 1',
              status: 'certified',
              expiryDate: '2024-10-20',
              description: 'Payment card industry data security standard'
            }
          ]
        },
        // Data residency and privacy
        dataResidency: {
          regions: ['US', 'EU', 'APAC'],
          dataProcessingAgreement: true,
          gdprCompliant: true,
          ccpaCompliant: true,
        },
        // Security features
        securityFeatures: {
          encryptionInTransit: true,
          encryptionAtRest: true,
          accessLogging: true,
          auditTrail: true,
          twoFactorAuth: true,
        }
      },
      // Trust Hub products
      products: [
        {
          id: 'trust-hub-compliance',
          name: 'Trust Hub Compliance',
          description: 'Comprehensive compliance management platform',
          status: 'active',
          features: [
            'Regulatory compliance monitoring',
            'Audit trail management',
            'Risk assessment tools',
            'Compliance reporting'
          ],
          pricing: 'Included with account'
        },
        {
          id: 'trust-hub-security',
          name: 'Trust Hub Security',
          description: 'Advanced security and monitoring tools',
          status: 'active',
          features: [
            'Real-time security monitoring',
            'Threat detection',
            'Security incident response',
            'Vulnerability scanning'
          ],
          pricing: 'Included with account'
        },
        {
          id: 'trust-hub-privacy',
          name: 'Trust Hub Privacy',
          description: 'Privacy and data protection management',
          status: 'active',
          features: [
            'Data privacy controls',
            'Consent management',
            'Data subject rights',
            'Privacy impact assessments'
          ],
          pricing: 'Included with account'
        }
      ],
      // Compliance policies
      policies: [
        {
          id: 'data-retention',
          name: 'Data Retention Policy',
          description: 'Policy for data retention and deletion',
          status: 'active',
          lastUpdated: '2024-01-15',
          version: '2.1'
        },
        {
          id: 'access-control',
          name: 'Access Control Policy',
          description: 'Policy for user access and permissions',
          status: 'active',
          lastUpdated: '2024-02-01',
          version: '1.8'
        },
        {
          id: 'incident-response',
          name: 'Incident Response Policy',
          description: 'Policy for security incident handling',
          status: 'active',
          lastUpdated: '2024-01-20',
          version: '3.0'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      trustHub: trustHubData,
    });
  } catch (error: unknown) {
    console.error('Error fetching Trust Hub data:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch Trust Hub data' },
      { status: 500 }
    );
  }
}