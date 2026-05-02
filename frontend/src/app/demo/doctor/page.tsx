"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import App from "@/components/doctor/DoctorApp";

export default function DoctorPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("mediflow_doctor_token");
    if (!token) {
      router.replace("/demo/doctor/auth");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <App />
    </div>
  );
}
