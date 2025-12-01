import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch pricing information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const countryCode = searchParams.get('countryCode') || 'US';
    // const type = searchParams.get('type') || 'local'; // Future use for different pricing types

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Check if pricing API is available
    if (!client.pricing || !client.pricing.v1) {
      return NextResponse.json({
        success: true,
        pricing: [],
        country: countryCode,
        totalItems: 0,
        message: 'Pricing API not available in this Twilio SDK version'
      });
    }

    let phoneNumberPricing, messagingPricing, voicePricing;
    
    try {
      // Fetch phone number pricing
      phoneNumberPricing = await client.pricing.v1.phoneNumbers.countries(countryCode).fetch();
    } catch (error) {
      console.log('Phone number pricing not available:', error);
      phoneNumberPricing = { phoneNumberPrices: [] };
    }
    
    try {
      // Fetch messaging pricing
      messagingPricing = await client.pricing.v1.messaging.countries(countryCode).fetch();
    } catch (error) {
      console.log('Messaging pricing not available:', error);
      messagingPricing = { inboundSmsPrices: [] };
    }
    
    try {
      // Fetch voice pricing
      voicePricing = await client.pricing.v1.voice.countries(countryCode).fetch();
    } catch (error) {
      console.log('Voice pricing not available:', error);
      voicePricing = { inboundCallPrices: [] };
    }

    const pricingData = {
      phoneNumbers: phoneNumberPricing.phoneNumberPrices?.map(price => ({
        numberType: price.number_type,
        basePrice: price.base_price,
        currentPrice: price.current_price,
        country: phoneNumberPricing.country,
      })) || [],
      messaging: messagingPricing.inboundSmsPrices?.map(price => ({
        numberType: price.number_type,
        basePrice: price.base_price,
        currentPrice: price.current_price,
        country: messagingPricing.country,
        unit: 'SMS',
      })) || [],
      voice: voicePricing.inboundCallPrices?.map(price => ({
        numberType: price.number_type,
        basePrice: price.base_price,
        currentPrice: price.current_price,
        country: voicePricing.country,
        unit: 'minute',
      })) || [],
    };

    // Combine all pricing data
    const allPricing = [
      ...pricingData.phoneNumbers.map(p => ({ ...p, category: 'Phone Numbers' })),
      ...pricingData.messaging.map(p => ({ ...p, category: 'Messaging' })),
      ...pricingData.voice.map(p => ({ ...p, category: 'Voice' })),
    ];

    return NextResponse.json({
      success: true,
      pricing: allPricing,
      country: countryCode,
      totalItems: allPricing.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching pricing information:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch pricing information' },
      { status: 500 }
    );
  }
}