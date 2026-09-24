"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { Course } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export function EnrollButton({ course }: { course: Course }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ courseId: course.courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      if (data.free) {
        router.push("/dashboard");
        return;
      }

      await loadRazorpayScript();
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        order_id: data.razorpayOrderId,
        name: "S8 Analytics",
        description: course.title,
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify({ orderId: data.orderId, ...response }),
            });
            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json().catch(() => ({}));
              setError(verifyData.error || "Payment could not be verified. Contact support if you were charged.");
              return;
            }
            router.push("/dashboard");
          } catch {
            setError("Payment could not be verified. Contact support if you were charged.");
          }
        },
        modal: {
          // User closed the checkout modal without completing payment.
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled.");
          },
        },
        theme: { color: "#065f46" },
      });
      rzp.on("payment.failed", (response: unknown) => {
        const description = (response as { error?: { description?: string } })?.error?.description;
        setError(description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? "Starting checkout..." : course.priceConfig.isFree ? "Enroll for free" : "Buy now"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}
