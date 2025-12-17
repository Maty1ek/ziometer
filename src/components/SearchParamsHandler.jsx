"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SearchParamsHandler({ onPaymentSuccess }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      onPaymentSuccess();

      // Clean URL without reloading
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router, onPaymentSuccess]);

  return null; // This component renders nothing
}