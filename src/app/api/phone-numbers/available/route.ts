import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Search available phone numbers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const countryCode = searchParams.get('countryCode') || 'US';
    const areaCode = searchParams.get('areaCode');
    const contains = searchParams.get('contains');
    const voiceEnabled = searchParams.get('voiceEnabled') === 'true';
    const smsEnabled = searchParams.get('smsEnabled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const searchOptions: Record<string, string | number | boolean> = {
      limit,
    };

    if (areaCode) searchOptions.areaCode = areaCode;
    if (contains) searchOptions.contains = contains;
    if (voiceEnabled) searchOptions.voiceEnabled = voiceEnabled;
    if (smsEnabled) searchOptions.smsEnabled = smsEnabled;

    const availableNumbers = await client.availablePhoneNumbers(countryCode).local.list(searchOptions);

    const numberData = availableNumbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      capabilities: {
        voice: number.capabilities.voice,
        sms: number.capabilities.sms,
        mms: number.capabilities.mms,
        fax: number.capabilities.fax,
      },
      locality: number.locality,
      region: number.region,
      countryCode: number.countryCode,
      lata: number.lata,
      rateCenter: number.rateCenter,
      latitude: number.latitude,
      longitude: number.longitude,
    }));

    return NextResponse.json({
      success: true,
      availableNumbers: numberData,
      countryCode,
      searchCriteria: {
        areaCode,
        contains,
        voiceEnabled,
        smsEnabled,
        limit,
      },
    });
  } catch (error: unknown) {
    console.error('Error searching available phone numbers:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search available phone numbers' },
      { status: 500 }
    );
  }
}