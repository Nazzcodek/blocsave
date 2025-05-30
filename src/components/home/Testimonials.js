import React from "react";
import Image from "next/image";

const Testimonials = () => {
  const testimonialData = [
    {
      id: 0,
      name: "AMANDIANEZE",
      role: "Growth Ambassador",
      image: "/icons/jujuboyNFT.png",
      comment:
        "Funny thing is, those who abscond with Adashe funds are often the most trusted — until they disappear 😂 We struggled with this in our own project. Hope Blocsave nails it.",
    },
    {
      id: 1,
      name: "Ruth Adeiza",
      role: "Market Woman (Bwari, Abuja)",
      image: "/icons/Adeiza.png",
      comment:
        "Yes, I'll use Blocsave for Adashe. It's a good idea — no middleman, transparent, and I can invite my friends too. That makes it even better.",
    },
    {
      id: 2,
      name: "Shina Ayomi",
      role: "Blockchain Dev",
      image: "/icons/shina.png",
      comment:
        "Onboarding using just an email, without needing a crypto wallet or seed phrase,  could really make it easier for everyone using Blocsave.",
    },
  ];

  return (
    <section id="testimonials" className="py-10 sm:py-20 bg-gray-50">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-center text-gray-900">
          What Our African Communities Said
        </h2>
        <p className="text-sm sm:text-lg text-center mb-6 sm:mb-12 max-w-3xl mx-auto text-gray-700">
          Hear directly from our community members about their experiences and
          expectations with Blocsave
        </p>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12">
          {/* Video Section */}
          <div className="w-full lg:w-1/2">
        
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
              <div className="relative pb-[56.25%]">
                <iframe
                  src="https://www.youtube.com/embed/TdB5yRm3UH4"
                  title="Market Survey Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg sm:rounded-xl"
                ></iframe>
              </div>
              <div className="absolute inset-0 pointer-events-none border border-[#079669] rounded-xl sm:rounded-2xl"></div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-4 sm:space-y-6">
              {testimonialData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-3 sm:mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-base sm:text-xl text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 italic">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>
                  <div className="mt-3 sm:mt-4 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#079669]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
