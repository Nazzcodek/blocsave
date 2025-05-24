"use client";

import {
  Header,
  WhyChoose,
  HowItWorks,
  SavingsOptions,
  Testimonials,
  FAQ,
  CTA,
} from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <WhyChoose />
      <HowItWorks />
      <SavingsOptions />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
  );
}
