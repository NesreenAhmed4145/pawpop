import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/HomePage";
import Profile from "./pages/Profile/ProfilePage";
import Login from "./pages/Auth/LoginPage";
import Register from "./pages/Auth/RegisterPage";
import NotMatch from "./pages/Errors/NotFoundPage";
import Adoption from "./pages/Adoption/AdoptionListPage";
import MyPets from "./pages/MyPets/MyPetsPage";
import PetProfilePage from "./pages/MyPets/PetProfilePage";


function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adoption" element={<Adoption />} />
            {/* <Route path="/" element={<Home />} /> */}

            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<NotMatch />} />
            <Route path="/my-pets" element={<MyPets/>} />
            <Route path="/my-pets/:id" element={<PetProfilePage/>} />

          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
