import { MapPin, Mail, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="w-full pt-16 min-h-screen bg-[#f5f5f5]">

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Address */}
        <div className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 py-6 text-center">

          <div className="w-16 h-16 mx-auto rounded-full border border-primary flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-primary scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <MapPin
              size={24}
              className="relative z-10 text-primary group-hover:text-white transition-colors duration-500"
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

          <div className="w-16 h-16 mx-auto rounded-full border border-primary flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-primary scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <Mail
              size={24}
              className="relative z-10 text-primary group-hover:text-white transition-colors duration-500"
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

          <div className="w-16 h-16 mx-auto rounded-full border border-primary flex items-center justify-center relative overflow-hidden">

            <span className="absolute inset-0 bg-primary scale-y-0 origin-bottom transition-transform duration-500 group-hover:scale-y-100"></span>

            <Phone
              size={24}
              className="relative z-10 text-primary group-hover:text-white transition-colors duration-500"
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
      <div className="grid lg:grid-cols-2 gap-8 mt-16 items-stretch">

        {/* Left */}
        <div className="flex flex-col h-full">

          <h2 className="text-3xl font-bold text-gray-900">
            Get In Touch
          </h2>

          <p className="mt-3 text-base text-gray-600 leading-7 max-w-xl">
            We'd love to hear from you. Whether you have questions
            about our products, need support with an order, or
            simply want to share feedback, our team is ready to help.
          </p>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-6 flex-1 flex flex-col">

            <div className="grid md:grid-cols-2 gap-5 p-6 flex-1">

              <input
                type="text"
                placeholder="Your Name"
                className="h-12 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-primary"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="h-12 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-primary"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="h-12 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-primary"
              />

              <input
                type="text"
                placeholder="Subject"
                className="h-12 border border-gray-300 rounded-md px-3 text-sm outline-none focus:border-primary"
              />

              <textarea
                placeholder="Your Message"
                className="md:col-span-2 border border-gray-300 rounded-md p-3 text-sm resize-none outline-none focus:border-primary flex-1 min-h-[120px]"
              />

              <div className="md:col-span-2 flex items-end">
                <button className="bg-primary text-white h-12 px-8 rounded-md text-sm font-medium hover:bg-primary/90 transition w-full md:w-auto">
                  Send Message
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Map */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm h-full min-h-[450px]">

          <iframe
            title="P2J Mart Location"
            src="https://www.google.com/maps?q=Tambaram,Chennai,Tamil%20Nadu&output=embed"
            className="w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen=""
          />

        </div>

      </div>

    </div>
  );
}