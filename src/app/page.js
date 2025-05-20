"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.push("/home");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Loading indicator while redirecting */}
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/icons/logo-green.svg"
          alt="Blocsave logo"
          width={60}
          height={60}
          priority
        />
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mt-8"></div>
        <p className="text-gray-600 mt-4">Redirecting to landing page...</p>
      </div>
    </div>
  );
}
