import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch compliance assessments
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

    // Note: In a real implementation, this would use the Trust Hub API
    // const client = twilio(accountSid, authToken);
    
    // Mock compliance assessments data
    const assessments = [
      {
        id: 'soc2-assessment-2024',
        name: 'SOC 2 Type II Assessment',
        type: 'SOC 2',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        score: 95,
        maxScore: 100,
        findings: [
          {
            id: 'finding-1',
            severity: 'low',
            description: 'Minor documentation gap in access control procedures',
            status: 'resolved',
            resolutionDate: '2024-02-15'
          }
        ],
        auditor: 'Deloitte & Touche LLP',
        reportUrl: 'https://trust-hub.twilio.com/reports/soc2-2024.pdf'
      },
      {
        id: 'iso27001-assessment-2024',
        name: 'ISO 27001 Assessment',
        type: 'ISO 27001',
        status: 'in-progress',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        score: null,
        maxScore: 100,
        findings: [
          {
            id: 'finding-2',
            severity: 'medium',
            description: 'Security awareness training needs updating',
            status: 'in-progress',
            resolutionDate: null
          }
        ],
        auditor: 'BSI Group',
        reportUrl: null
      },
      {
        id: 'pci-dss-assessment-2024',
        name: 'PCI DSS Level 1 Assessment',
        type: 'PCI DSS',
        status: 'scheduled',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        score: null,
        maxScore: 100,
        findings: [],
        auditor: 'Trustwave',
        reportUrl: null
      }
    ];

    return NextResponse.json({
      success: true,
      assessments,
      totalAssessments: assessments.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching compliance assessments:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch compliance assessments' },
      { status: 500 }
    );
  }
}

// POST - Create a new compliance assessment
export async function POST(request: NextRequest) {
  try {
    const { 
      accountSid, 
      authToken, 
      name, 
      type, 
      startDate, 
      endDate, 
      auditor 
    } = await request.json();

    if (!accountSid || !authToken || !name || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, name, type, start date, and end date are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would create the assessment in Trust Hub
    const newAssessment = {
      id: `assessment-${Date.now()}`,
      name,
      type,
      status: 'scheduled',
      startDate,
      endDate,
      score: null,
      maxScore: 100,
      findings: [],
      auditor: auditor || 'TBD',
      reportUrl: null
    };

    return NextResponse.json({
      success: true,
      message: 'Compliance assessment created successfully',
      assessment: newAssessment,
    });
  } catch (error: unknown) {
    console.error('Error creating compliance assessment:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create compliance assessment' },
      { status: 500 }
    );
  }
}