import back from "../../assets/img/back.svg";
import { Link } from "react-router-dom";
import icon from "../../assets/img/Pawpop Pet Care1.png";
import { FaPhone } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";



function Footer() {
  return (
    <>
      <footer className="relative w-full min-h-[300px] mt-auto">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-section"
          style={{
            WebkitMaskImage: `url("${back}")`,
            maskImage: `url("${back}")`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
        <div className="relative max-w-[1440px] mx-auto px-8 md:px-20 pt-26">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-8 text-brand">Quick Links</h2>

              <ul className="space-y-3 text-xl text-text-title">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/adoption">Adoption</Link>
                </li>
                <li>
                  <Link to="/accommodation">Accommodation</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-brand">Social Media</h2>

              <ul className="space-y-3 text-xl text-text-title">
                <li>
                  <a href="#">Facebook</a>
                </li>
                <li>
                  <a href="#">Instagram</a>
                </li>
                <li>
                  <a href="#">Twitter</a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 text-brand">Contact Information</h2>

              <ul className="space-y-3 text-xl text-text-title">
                <li className="flex gap-2"> <FaLocationDot /> Madinaty, Second New Cairo, Cairo Governorate, Egypt</li>
                <li className="flex gap-2"><FaPhone /> +20 1200518443</li>
                <li className="flex gap-2"><MdEmail /> Info@pawpop.com</li>
              </ul>
            </div>

            <div className="text-center">
              <img src={icon} alt="icon" className="h-50 " />
              <h2 className="text-4xl font-bold text-brand">PawPop</h2>
              <p className="text-xl text-text-body font-semibold mb-8">
                Everything your pet needs, all in one place.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
