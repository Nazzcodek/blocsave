import React from "react";
import Image from "next/image";

const Testimonials = () => {
  const testimonialData = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Small Business Owner",
      image: "/icons/Memoji.svg",
      comment:
        "Blocsave has completely changed how I manage my savings. The stable value and high returns have helped my business grow steadily.",
    },
    {
      id: 2,
      name: "Michael Okonkwo",
      role: "Software Engineer",
      image: "/icons/Memoji1.svg",
      comment:
        "As someone who understands technology, I appreciate Blocsave's innovative approach to savings. The stablecoin foundation gives me confidence my money is safe.",
    },
    {
      id: 3,
      name: "Amina Bello",
      role: "Medical Doctor",
      image: "/icons/Memoji2.svg",
      comment:
        "The Ajo group savings feature helped our hospital staff save for equipment. The transparent system and automated distributions make it so easy to use.",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-[100px]">
        <h2 className="text-4xl font-bold mb-4 text-center">
          What Our Users Say
        </h2>
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
          Join thousands of people discovering a better way to save and grow
          their money.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialData.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-2xl shadow-sm flex flex-col"
            >
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="rounded-full mr-4"
                />
                <div>
                  <h3 className="font-bold text-xl">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &ldquo;{testimonial.comment}&rdquo;
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-500"
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
    </section>
  );
};

export default Testimonials;
