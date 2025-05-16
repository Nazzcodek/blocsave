import Head from "next/head";
import {
  Header,
  WhyChoose,
  HowItWorks,
  SavingsOptions,
  Testimonials,
  FAQ,
  CTA,
} from "../../components/home";

export default function Home() {
  return (
    <div className="font-sans">
      <Head>
        <title>Blocsave - The better way to save in Stablecoins</title>
        <meta
          name="description"
          content="Save your money in stablecoins, beat inflation, and build wealth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <WhyChoose />
      <HowItWorks />
      <SavingsOptions />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
