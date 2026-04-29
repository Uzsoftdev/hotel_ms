import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

// Public
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

// User
import UserDashboard from "./pages/user/Dashboard";
import MyBookings from "./pages/user/MyBookings";
import BookingDetails from "./pages/user/BookingDetails";
import ProfileManagement from "./pages/user/ProfileManagement";
import PaymentHistory from "./pages/user/PaymentHistory";
import Reviews from "./pages/user/Reviews";
import Notifications from "./pages/user/Notifications";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AllBookings from "./pages/admin/bookings/AllBookings";
import AdminCheckInOut from "./pages/admin/bookings/CheckInOut";
import RoomsList from "./pages/admin/rooms/RoomsList";
import RoomTypes from "./pages/admin/rooms/RoomTypes";
import AddRoom from "./pages/admin/rooms/AddRoom";
import DynamicPricing from "./pages/admin/pricing/DynamicPricing";
import BlackoutDates from "./pages/admin/pricing/BlackoutDates";
import OccupancyReport from "./pages/admin/reports/OccupancyReport";
import RevenueReport from "./pages/admin/reports/RevenueReport";
import GuestAnalytics from "./pages/admin/reports/GuestAnalytics";
import AllGuests from "./pages/admin/users/AllGuests";
import StaffAccounts from "./pages/admin/users/StaffAccounts";
import AddUser from "./pages/admin/users/AddUser";
import ActivityLogs from "./pages/admin/system/ActivityLogs";
import Settings from "./pages/admin/system/Settings";
import AdminProfile from "./pages/admin/AdminProfile";

// Staff
import AssignedBookings from "./pages/staff/AssignedBookings";
import StaffCheckInOut from "./pages/staff/CheckInOut";
import RoomStatusBoard from "./pages/staff/RoomStatusBoard";
import TaskManagement from "./pages/staff/TaskManagement";
import DailySummary from "./pages/staff/DailySummary";
import GuestRequests from "./pages/staff/GuestRequests";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffSettings from "./pages/staff/StaffSettings";

// User extra
import UserSettings from "./pages/user/UserSettings";
import EditBooking from "./pages/user/EditBooking";
import SavedRooms from "./pages/user/SavedRooms";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/room-details/:id" element={<RoomDetails />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />

      {/* User (authenticated guests) */}
      <Route path="/dashboard" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><UserDashboard /></PrivateRoute>} />
      <Route path="/my-bookings" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><MyBookings /></PrivateRoute>} />
      <Route path="/my-bookings/:id" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><BookingDetails /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><ProfileManagement /></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><PaymentHistory /></PrivateRoute>} />
      <Route path="/reviews" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><Reviews /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><Notifications /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><UserSettings /></PrivateRoute>} />
      <Route path="/saved" element={<PrivateRoute roles={["guest","staff","hotel_admin","super_admin"]}><SavedRooms /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/bookings" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AllBookings /></PrivateRoute>} />
      <Route path="/admin/checkinout" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AdminCheckInOut /></PrivateRoute>} />
      <Route path="/admin/rooms" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><RoomsList /></PrivateRoute>} />
      <Route path="/admin/room-types" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><RoomTypes /></PrivateRoute>} />
      <Route path="/admin/rooms/add" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AddRoom /></PrivateRoute>} />
      <Route path="/admin/pricing" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><DynamicPricing /></PrivateRoute>} />
      <Route path="/admin/blackout-dates" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><BlackoutDates /></PrivateRoute>} />
      <Route path="/admin/reports/occupancy" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><OccupancyReport /></PrivateRoute>} />
      <Route path="/admin/reports/revenue" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><RevenueReport /></PrivateRoute>} />
      <Route path="/admin/reports/guests" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><GuestAnalytics /></PrivateRoute>} />
      <Route path="/admin/guests" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AllGuests /></PrivateRoute>} />
      <Route path="/admin/staff" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><StaffAccounts /></PrivateRoute>} />
      <Route path="/admin/users/add" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AddUser /></PrivateRoute>} />
      <Route path="/admin/activity-logs" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><ActivityLogs /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><Settings /></PrivateRoute>} />
      <Route path="/admin/profile" element={<PrivateRoute roles={["hotel_admin","super_admin"]}><AdminProfile /></PrivateRoute>} />

      {/* Staff */}
      <Route path="/staff/bookings" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><AssignedBookings /></PrivateRoute>} />
      <Route path="/staff/checkinout" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><StaffCheckInOut /></PrivateRoute>} />
      <Route path="/staff/rooms" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><RoomStatusBoard /></PrivateRoute>} />
      <Route path="/staff/tasks" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><TaskManagement /></PrivateRoute>} />
      <Route path="/staff/daily-summary" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><DailySummary /></PrivateRoute>} />
      <Route path="/staff/guest-requests" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><GuestRequests /></PrivateRoute>} />
      <Route path="/staff/profile" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><StaffProfile /></PrivateRoute>} />
      <Route path="/staff/settings" element={<PrivateRoute roles={["staff","hotel_admin","super_admin"]}><StaffSettings /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
