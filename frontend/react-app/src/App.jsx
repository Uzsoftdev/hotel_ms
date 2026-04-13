import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Rooms from "./pages/public/Rooms";
import Booking from "./pages/public/Booking";
import SearchResults from "./pages/public/SearchResults";
import FAQ from "./pages/public/FAQ";
import RoomDetails from "./pages/public/RoomDetails";
import ForgotPassword from "./pages/public/ForgotPassword";
import BookingConfirmation from "./pages/public/BookingConfirmation";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/room-details" element={<RoomDetails />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
