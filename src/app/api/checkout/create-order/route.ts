import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/verify-auth";
import { adminDb } from "@/lib/firebase.admin";
import { getRazorpay } from "@/lib/razorpay";
import { effectivePrice } from "@/lib/queries";
import type { Course, Order, Enrolment } from "@/lib/types";

export async function POST(req: NextRequest) {
  const decoded = await requireUser(req);
  if (!decoded) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { courseId } = (await req.json()) as { courseId: string };
  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  const course = courseDoc.data() as Course;
  if (course.status !== "published") return NextResponse.json({ error: "Course not available" }, { status: 400 });

  const { price } = effectivePrice(course);

  if (price > 0 && price < 100) {
    return NextResponse.json({ error: "Amount must be at least ₹1 (100 paise)" }, { status: 400 });
  }

  const orderRef = adminDb.collection("orders").doc();
  const order: Order = {
    orderId: orderRef.id,
    studentId: decoded.uid,
    lineItems: [
      {
        courseId: course.courseId,
        instructorId: course.instructorId,
        title: course.title,
        unitPrice: price,
      },
    ],
    gross: price,
    discount: 0,
    paymentState: price === 0 ? "captured" : "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (price === 0) {
    // Free course: activate entitlement immediately, no payment gateway involved.
    await orderRef.set(order);
    const enrolmentRef = adminDb.collection("enrolments").doc();
    const enrolment: Enrolment = {
      enrolmentId: enrolmentRef.id,
      studentId: decoded.uid,
      courseId: course.courseId,
      purchaseId: order.orderId,
      entitlementStatus: "active",
      startDate: new Date().toISOString(),
    };
    await enrolmentRef.set(enrolment);
    return NextResponse.json({ free: true });
  }

  let rzpOrder: { id: string };
  try {
    rzpOrder = await getRazorpay().orders.create({
      amount: price,
      currency: "INR",
      receipt: order.orderId,
      notes: { courseId: course.courseId, studentId: decoded.uid },
    });
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 401) {
      return NextResponse.json({ error: "Payment gateway authentication failed" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not create payment order" }, { status: 500 });
  }

  order.providerOrderRef = rzpOrder.id;
  await orderRef.set(order);

  return NextResponse.json({
    orderId: order.orderId,
    razorpayOrderId: rzpOrder.id,
    amount: price,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
}
