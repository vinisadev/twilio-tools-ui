import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch usage records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') || '50';

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const options: Record<string, string> = {
      limit: limit,
    };

    if (category) options.category = category;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    // Check if usage records API is available
    if (!client.usage || !client.usage.records) {
      return NextResponse.json({
        success: true,
        usageRecords: [],
        totalRecords: 0,
        message: 'Usage records API not available in this Twilio SDK version'
      });
    }

    // Try to fetch usage records
    const usageRecords = await client.usage.records.list(options);

    const usageData = usageRecords.map(record => ({
      category: record.category,
      description: record.description,
      accountSid: record.accountSid,
      startDate: record.startDate,
      endDate: record.endDate,
      price: record.price,
      priceUnit: record.priceUnit,
      count: record.count,
      countUnit: record.countUnit,
      usage: record.usage,
      usageUnit: record.usageUnit,
      uri: record.uri,
    }));

    return NextResponse.json({
      success: true,
      usageRecords: usageData,
      totalRecords: usageRecords.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching usage records:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch usage records' },
      { status: 500 }
    );
  }
}