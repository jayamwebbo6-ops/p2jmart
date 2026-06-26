import { useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { createEnqueriesAPI } from "../../api/enqueriesApi";
import { toast } from "../../components/toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Please provide your name";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please provide your email";
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Please provide your phone number";
    } else if (!/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please provide a valid phone number";
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Please provide a subject";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters long";
    } else if (formData.subject.length > 100) {
      newErrors.subject = "Subject cannot exceed 100 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Please provide your message";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    } else if (formData.message.length > 1000) {
      newErrors.message = "Message cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const response = await createEnqueriesAPI(formData);

      toast.success(response.message || "Enquiry submitted successfully.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.error(error);

      let errMsg = error.response?.data?.message || error.message || "Failed to submit enquiry. Please try again.";
      if (typeof errMsg === 'string') {
        errMsg = errMsg.replace(/https?:\/\/localhost:\d+\/?/gi, '');
        errMsg = errMsg.replace(/localhost:\d+/gi, '');
        errMsg = errMsg.replace(/127\.0\.0\.1:\d+/gi, '');
        if (errMsg.toLowerCase().includes('network error') || errMsg.toLowerCase().includes('connrefused') || errMsg.toLowerCase().includes('failed to fetch')) {
          errMsg = "Unable to connect to the server. Please try again later.";
        }
      }

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

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
            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-5 p-6 flex-1"
            >
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className={`w-full h-12 border rounded-md px-3 text-sm outline-none transition ${
                    errors.name
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-primary"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className={`w-full h-12 border rounded-md px-3 text-sm outline-none transition ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-primary"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className={`w-full h-12 border rounded-md px-3 text-sm outline-none transition ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-primary"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                  className={`w-full h-12 border rounded-md px-3 text-sm outline-none transition ${
                    errors.subject
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-primary"
                  }`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  required
                  className={`w-full border rounded-md p-3 text-sm resize-none outline-none transition min-h-[120px] ${
                    errors.message
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-primary"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={loading || Object.values(errors).some(v => v)}
                  className="bg-primary text-white h-12 px-8 rounded-md text-sm font-medium hover:bg-primary/90 transition w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
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
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}