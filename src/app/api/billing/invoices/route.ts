import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch invoices
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

    // Note: Twilio doesn't have a direct invoices API in the Node.js SDK
    // This would typically be handled through webhooks or external billing systems
    // For now, we'll return a mock response structure
    const invoices: Record<string, unknown>[] = [];

    const invoiceData = invoices.map(invoice => ({
      sid: invoice.sid,
      accountSid: invoice.accountSid,
      dateCreated: invoice.dateCreated,
      dateUpdated: invoice.dateUpdated,
      date: invoice.date,
      status: invoice.status,
      amount: invoice.amount,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      currency: invoice.currency,
      friendlyName: invoice.friendlyName,
      uri: invoice.uri,
    }));

    return NextResponse.json({
      success: true,
      invoices: invoiceData,
      totalInvoices: invoices.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching invoices:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}