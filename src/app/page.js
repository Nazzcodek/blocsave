import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to My Application
        </h1>

        <p className="text-xl text-center text-gray-600 max-w-md mb-8">
          This is a clean, empty home page ready for your content.
        </p>
      </main>
    </div>
  );
}
