import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import Logo from "../../assets/img/PawpopPetCareLogo.png";
import useAuth from "../../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import { FaHeart, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import { MdPets } from "react-icons/md";


function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const navLinkStyle = `relative text-ink hover:text-brand-hover
                        after:content-[''] after:absolute
                        after:left-0 after:-bottom-1
                        after:w-0 after:h-[2px]
                        after:bg-brand-hover hover:after:w-full
                        after:transition-all after:duration-500
                        after:ease-in-out text-sm md:text-base lg:text-lg font-bold`;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-page w-full border-b border-ink/20 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={Logo} className="h-15" alt="Logo" />
        </Link>

        <div
          className={`${isMenuOpen ? "block" : "hidden"} w-full md:block md:w-auto`}
        >
          <ul className="flex flex-col md:flex-row md:gap-8 mt-4 md:mt-0 font-medium">
            <li>
              <Link to="/" onClick={closeMenu} className={navLinkStyle}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/adoption" onClick={closeMenu} className={navLinkStyle}>
                Adoption
              </Link>
            </li>
            <li>
              <Link
                to="/accommodation"
                onClick={closeMenu}
                className={navLinkStyle}
              >
                Accommodation
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu} className={navLinkStyle}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {loading ? (
            <span className="h-11 w-11" aria-hidden="true" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-full
    border border-ink/20 bg-section text-brand transition
    hover:bg-brand hover:text-brand-contrast"
                aria-label="Account menu"
              >
                <FaRegUser size={18} />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 top-14 z-50 w-52 rounded-2xl
      border border-ink/10 bg-page p-2 shadow-xl"
                >
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-3
        text-ink hover:bg-section transition"
                  >
                    <FaRegUser />
                    Profile
                  </Link>

                  <Link
                    to="/favorites"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-3
        text-ink hover:bg-section transition"
                  >
                    <FaHeart className="text-red-400" />
                    Favorites
                  </Link>

                  <Link
                    to="/requestAdoption"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-3
        text-ink hover:bg-section transition"
                  >
                    <FaClipboardList />
                    Requests Adopation
                  </Link>
                  <Link
                    to="/my-pets"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-3
        text-ink hover:bg-section transition"
                  >
                   <MdPets />
                    My Pets
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand px-6 py-3 text-lg font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-ink"
            aria-label="Toggle menu"
          >
            <GiHamburgerMenu size={25} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
