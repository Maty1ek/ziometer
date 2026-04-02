"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SearchParamsHandler({ onPaymentSuccess }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHandledPayment = useRef(false);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);

  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
  }, [onPaymentSuccess]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus !== "success") {
      hasHandledPayment.current = false;
      return;
    }

    if (hasHandledPayment.current) {
      return;
    }

    hasHandledPayment.current = true;
    onPaymentSuccessRef.current?.();

    // Clean URL without reloading
    router.replace("/", { scroll: false });
  }, [searchParams, router]);

  return null; // This component renders nothing
}
