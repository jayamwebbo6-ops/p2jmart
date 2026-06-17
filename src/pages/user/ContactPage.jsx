import { MapPin, Mail, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="w-full pt-16 min-h-screen bg-[#f5f5f5]">

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Address */}
        <div className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-6 text-center">

          <div className="w-16 h-16 mx-auto rounded-full border border-[#002060] flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-[#002060] scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <MapPin
              size={24}
              className="relative z-10 text-[#002060] group-hover:text-white transition-colors duration-500"
            />
          </div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            Address
          </h3>

          <p className="mt-2 text-sm text-gray-600 leading-7">
            25, Vembuliamman Koil Street
            <br />
            West K.K Nagar
            <br />
            Chennai - 600078
          </p>
        </div>

        {/* Email */}
        <div className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-6 text-center">

          <div className="w-16 h-16 mx-auto rounded-full border border-[#002060] flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-[#002060] scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <Mail
              size={24}
              className="relative z-10 text-[#002060] group-hover:text-white transition-colors duration-500"
            />
          </div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            Email
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            p2jmart@gmail.com
          </p>
        </div>

        {/* Phone */}
        <div className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-6 text-center">

          <div className="w-16 h-16 mx-auto rounded-full border border-[#002060] flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-[#002060] scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <Phone
              size={24}
              className="relative z-10 text-[#002060] group-hover:text-white transition-colors duration-500"
            />
          </div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            Phone
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            +91 987456123
          </p>
        </div>
      </div>

      {/* Form & Map */}
      <div className="grid lg:grid-cols-2 gap-8 mt-16">

        {/* Left */}
        <div>

          <h2 className="text-3xl font-bold text-gray-900">
            Get In Touch
          </h2>

          <p className="mt-3 text-base text-gray-600 leading-7 max-w-xl">
            We'd love to hear from you. Whether you have questions
            about our products, need support with an order, or
            simply want to share feedback, our team is ready to help.
          </p>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-6">

            <div className="grid md:grid-cols-2 gap-4 p-5">

              <input
                type="text"
                placeholder="Your Name"
                className="h-11 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-[#002060]"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="h-11 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-[#002060]"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="h-11 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-[#002060]"
              />

              <input
                type="text"
                placeholder="Subject"
                className="h-11 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-[#002060]"
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                className="md:col-span-2 border border-gray-300 rounded-md p-3 text-sm resize-none outline-none focus:border-[#002060]"
              />

              <button className="bg-[#002060] text-white h-11 px-6 rounded-md text-sm font-medium hover:bg-[#001746] transition">
                Send Message
              </button>

            </div>

          </div>
        </div>

        {/* Right Map */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">

          <iframe
            title="P2J Mart Location"
            src="https://www.google.com/maps?q=Tambaram,Chennai,Tamil%20Nadu&output=embed"
            width="100%"
            height="550"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen=""
          />

        </div>

      </div>

    </div>
  );
}