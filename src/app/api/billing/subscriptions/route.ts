import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch account information (subscription details)
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
    
    // Try to fetch account balance
    let balance;
    try {
      balance = await client.balance.fetch();
    } catch (error) {
      console.log('Balance API not available:', error);
      balance = {
        accountSid: accountSid,
        balance: '0.00',
        currency: 'USD'
      };
    }

    const subscriptionData = {
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
        dateCreated: account.dateCreated,
        dateUpdated: account.dateUpdated,
        authToken: account.authToken ? '***' : null,
      },
      balance: {
        accountSid: balance.accountSid,
        balance: balance.balance,
        currency: balance.currency,
      },
    };

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
    });
  } catch (error: unknown) {
    console.error('Error fetching subscription information:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription information' },
      { status: 500 }
    );
  }
}

// PUT - Update account information
export async function PUT(request: NextRequest) {
  try {
    const { accountSid, authToken, friendlyName, status } = await request.json();

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const updateOptions: Record<string, string> = {};
    if (friendlyName) updateOptions.friendlyName = friendlyName;
    if (status) updateOptions.status = status;

    const account = await client.api.accounts(accountSid).update(updateOptions as { friendlyName?: string; status?: 'active' | 'suspended' | 'closed' });

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
        dateCreated: account.dateCreated,
        dateUpdated: account.dateUpdated,
      },
    });
  } catch (error: unknown) {
    console.error('Error updating account:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}