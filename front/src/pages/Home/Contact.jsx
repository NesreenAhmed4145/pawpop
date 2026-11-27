import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import petC from "../../assets/img/Contact.png";
import { FaPaw } from "react-icons/fa6";

function Contact() {
  const form = useRef();
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailjs.sendForm(
        "service_qdpepld",
        "template_p6kg46k",
        form.current,
        {
          publicKey: "2QzaxDwQf2sAZLTOF",
        },
      );

      await Swal.fire({
        title: "Message Sent Successfully!",
        text: "Thank you for reaching out. Our humans will get back to you soon! 🐾",
        icon: "success",
        confirmButtonColor: "#502308",
        background: "#FFFFFF",
      });

      form.current.reset();
    } catch (error) {
      console.log("FAILED...", error);

      Swal.fire({
        title: "Oops!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#502308",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl px-5 py-4 text-text-body text-lg outline-none border border-section focus:border-brand placeholder:text-text-muted";

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="mb-12 md:mb-16">
          <span className="inline-block text-text-muted font-semibold text-md mb-4">
            CONTACT PAWPOP
          </span>

          <h1 className="text-3xl md:text-7xl font-bold text-text-heading">
            Get in Touch
          </h1>

          <p className="text-text-body text-3xl md:text-lg md:font-semibold mt-5 max-w-2xl">
            We'd love to hear from you! Whether you have a question, need help,
            or just want to say hello, we're always happy to help you and your
            furry friends.
          </p>
        </div>

        <div className="border border-line rounded-3xl p-6 md:p-10 shadow-[0_10px_40px_rgba(80,35,8,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12">
            <div className="w-full flex items-center justify-center">
              <img
                src={petC}
                alt="PawPop dog welcoming visitors"
                className="w-full h-auto object-contain max-w-[500px]"
              />
            </div>

            <div className="w-full">
              <div className="mb-4">
                <h2 className="text-2xl flex gap-3 md:text-4xl font-bold text-[#502308] mt-2">
                  Let's Talk, Human! <FaPaw />
                </h2>
                <p className="text-text-body text-lg mt-3 leading-7">
                  Got questions, ideas, or need a little help? We'd love to hear
                  from you. Drop us a message!
                </p>
              </div>

              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div>
                  <label className="block mb-2 text-xl font-semibold text-text-title">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="user_name"
                    placeholder="Enter your name"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xl font-semibold text-text-title">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="user_email"
                    placeholder="Enter your email"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xl font-semibold text-text-title">
                    Your Message
                  </label>

                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Write your message here..."
                    className={`${inputStyle} resize-none`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-brand text-white text-center py-4 rounded-xl font-semibold text-xl hover:bg-brand-hover hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? ("Sending...") : (
                    <> Send Message <FaPaw /> </> )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
