import back from "../../assets/img/back.svg";
import { Link } from "react-router-dom";
import icon from "../../assets/img/Pawpop Pet Care1.png";
import { FaPhone } from "react-icons/fa6";

function Footer() {
  return (
    <>
      <footer className="relative w-full min-h-[300px] mt-auto">
        {/* شكل الموجة: الـ SVG بيشتغل كـ mask واللون بييجي من الثيم */}
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
              <h2 className="text-2xl font-bold mb-8">Quick Links</h2>

              <ul className="space-y-3 text-lg text-muted">
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
              <h2 className="text-2xl font-bold mb-8">Social Media</h2>

              <ul className="space-y-3 text-lg text-muted">
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
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

              <ul className="space-y-3 text-lg text-muted">
                <li>Madinaty, Second New Cairo, Cairo Governorate, Egypt</li>
                <li><FaPhone /> +20 1200518443</li>
                <li>Info@pawpop.com</li>
              </ul>
            </div>

            <div className="text-center">
              <img src={icon} alt="icon" className="h-50 " />
              <h2>PawPop</h2>
              <p className="text-lg text-muted mb-8">
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
