import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Check for Mock Mode (if keys are missing or placeholders)
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("rzp_test_your_key_id")) {
      console.log("Using Mock Payment Mode");
      return NextResponse.json({
        orderId: "order_mock_" + Math.random().toString(36).substring(7),
        amount: amount * 100,
        currency: "INR",
        isMock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false
    });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
