import { Link } from "react-router-dom";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Logo from "../../assets/img/PawpopPetCareLogo.png"
import profile from "../../assets/img/cat.jpeg"


function Navbar() {
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const navLinkStyle = `relative text-ink hover:text-brand-hover
                          after:content-[''] after:absolute
                          after:left-0 after:-bottom-1
                          after:w-0 after:h-[2px]
                          after:bg-brand-hover hover:after:w-full
                          after:transition-all after:duration-500
                          after:ease-in-out text-sm md:text-base lg:text-lg font-bold
                          `;
    return ( 
        <>      
    <nav className="bg-white  w-full  border-b border-ink/20 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={Logo}
            className="h-15"
            alt="Logo"
          />
        </Link>
          <div className={`${isMenuOpen ? "block" : "hidden"} w-full md:block md:w-auto`}>

          <ul className="flex flex-col md:flex-row md:gap-8 mt-4 md:mt-0 font-medium">

            <li>
                <Link to="/" className={navLinkStyle}>Home</Link>
            </li>
            <li>
                <Link to="/adoption" className={navLinkStyle}>Adoption</Link>
            </li>
            <li>
                <Link to="/accommodation" className={navLinkStyle}>Accommodation</Link>
            </li>
            <li>
                <Link to="/contact" className={navLinkStyle}>Contact</Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
                  <Link to="/profile">
                     <img
              src={profile}
              className="w-14 h-12 rounded-full"
              alt="User"
            />
        </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            <GiHamburgerMenu size={25}/>

          </button>

        </div>

      </div>
    </nav>





        </>
     );
}

export default Navbar;