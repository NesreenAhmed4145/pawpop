import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/HomePage";
import Profile from "./pages/Profile/ProfilePage";
import Login from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/RegisterPage";
import NotMatch from "./pages/Errors/NotFoundPage";
import Adoption from "./pages/Adoption/AdoptionListPage";
import PetDetails from './pages/Adoption/PetDetailsPage';
import FavoritesPage from "./pages/Profile/Favorite";
import Contact from './pages/Home/Contact';
import RequestAdoption from './pages/Adoption/MyAdoptionRequestsPage';

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adoption" element={<Adoption />} />
            <Route path="/PetDetails/:id" element={<PetDetails />} />
            <Route path="/adoptionPet/:id" element={<Home />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/requestAdoption" element={<RequestAdoption />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<NotMatch />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
