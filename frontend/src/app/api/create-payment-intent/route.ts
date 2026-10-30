import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import MoneyDonation from '@/models/MoneyDonation';

export async function POST(req: Request) {
  try {
    const { amount, email } = await req.json();
    const paise = Math.round(amount * 100);
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 50 || !Number.isSafeInteger(paise) || Math.abs(amount * 100 - paise) > 0.00001 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Provide a valid email and donation amount of at least INR 50 with up to two decimal places' }, { status: 400 });
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.includes('your_key_id')) {
      return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 });
    }
    await dbConnect();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({ amount: paise, currency: 'INR' });
    await MoneyDonation.create({ orderId: order.id, email: email.trim().toLowerCase(), amount: paise });
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Create donation order failed:', error);
    return NextResponse.json({ error: 'Could not create payment order' }, { status: error instanceof SyntaxError ? 400 : 500 });
  }
}
