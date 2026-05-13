import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Public pages
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Rooms from "../pages/public/Rooms";
import Booking from "../pages/public/Booking";
import SearchResults from "../pages/public/SearchResults";
import FAQ from "../pages/public/FAQ";
import RoomDetails from "../pages/public/RoomDetails";
import ForgotPassword from "../pages/public/ForgotPassword";
import BookingConfirmation from "../pages/public/BookingConfirmation";
import AuthCallback from "../pages/auth/AuthCallback";

// User pages
import UserDashboard from "../pages/user/Dashboard";
import MyBookings from "../pages/user/MyBookings";
import BookingDetails from "../pages/user/BookingDetails";
import EditBooking from "../pages/user/EditBooking";
import ProfileManagement from "../pages/user/ProfileManagement";
import PaymentHistory from "../pages/user/PaymentHistory";
import Notifications from "../pages/user/Notifications";
import Reviews from "../pages/user/Reviews";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProfile from "../pages/admin/AdminProfile";
import AllBookings from "../pages/admin/bookings/AllBookings";
import AdminCheckInOut from "../pages/admin/bookings/CheckInOut";
import RoomsList from "../pages/admin/rooms/RoomsList";
import AddRoom from "../pages/admin/rooms/AddRoom";
import EditRoom from "../pages/admin/rooms/EditRoom";
import RoomTypes from "../pages/admin/rooms/RoomTypes";
import DynamicPricing from "../pages/admin/pricing/DynamicPricing";
import BlackoutDates from "../pages/admin/pricing/BlackoutDates";
import AllGuests from "../pages/admin/users/AllGuests";
import StaffAccounts from "../pages/admin/users/StaffAccounts";
import AddUser from "../pages/admin/users/AddUser";
import OccupancyReport from "../pages/admin/reports/OccupancyReport";
import RevenueReport from "../pages/admin/reports/RevenueReport";
import GuestAnalytics from "../pages/admin/reports/GuestAnalytics";
import ActivityLogs from "../pages/admin/system/ActivityLogs";
import Settings from "../pages/admin/system/Settings";

// Staff pages
import AssignedBookings from "../pages/staff/AssignedBookings";
import CheckInOut from "../pages/staff/CheckInOut";
import DailySummary from "../pages/staff/DailySummary";
import GuestRequests from "../pages/staff/GuestRequests";
import RoomStatusBoard from "../pages/staff/RoomStatusBoard";
import TaskManagement from "../pages/staff/TaskManagement";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/rooms" element={<Navigate to="/hotels" replace />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/room-details" element={<RoomDetails />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ── Protected: User routes ── */}
      <Route path="/user/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/user/bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
      <Route path="/user/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
      <Route path="/user/bookings/:id/edit" element={<PrivateRoute><EditBooking /></PrivateRoute>} />
      <Route path="/user/profile" element={<PrivateRoute><ProfileManagement /></PrivateRoute>} />
      <Route path="/user/payments" element={<PrivateRoute><PaymentHistory /></PrivateRoute>} />
      <Route path="/user/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/user/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />

      {/* ── Protected: Admin routes ── */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/profile" element={<PrivateRoute><AdminProfile /></PrivateRoute>} />
      <Route path="/admin/bookings" element={<PrivateRoute><AllBookings /></PrivateRoute>} />
      <Route path="/admin/checkinout" element={<PrivateRoute><AdminCheckInOut /></PrivateRoute>} />
      <Route path="/admin/rooms" element={<PrivateRoute><RoomsList /></PrivateRoute>} />
      <Route path="/admin/rooms/add" element={<PrivateRoute><AddRoom /></PrivateRoute>} />
      <Route path="/admin/rooms/:id/edit" element={<PrivateRoute><EditRoom /></PrivateRoute>} />
      <Route path="/admin/room-types" element={<PrivateRoute><RoomTypes /></PrivateRoute>} />
      <Route path="/admin/pricing" element={<PrivateRoute><DynamicPricing /></PrivateRoute>} />
      <Route path="/admin/blackout-dates" element={<PrivateRoute><BlackoutDates /></PrivateRoute>} />
      <Route path="/admin/guests" element={<PrivateRoute><AllGuests /></PrivateRoute>} />
      <Route path="/admin/staff" element={<PrivateRoute><StaffAccounts /></PrivateRoute>} />
      <Route path="/admin/users/add" element={<PrivateRoute><AddUser /></PrivateRoute>} />
      <Route path="/admin/reports/occupancy" element={<PrivateRoute><OccupancyReport /></PrivateRoute>} />
      <Route path="/admin/reports/revenue" element={<PrivateRoute><RevenueReport /></PrivateRoute>} />
      <Route path="/admin/reports/guests" element={<PrivateRoute><GuestAnalytics /></PrivateRoute>} />
      <Route path="/admin/activity-logs" element={<PrivateRoute><ActivityLogs /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

      {/* ── Protected: Staff routes ── */}
      <Route path="/staff/bookings" element={<PrivateRoute><AssignedBookings /></PrivateRoute>} />
      <Route path="/staff/check-in-out" element={<PrivateRoute><CheckInOut /></PrivateRoute>} />
      <Route path="/staff/daily-summary" element={<PrivateRoute><DailySummary /></PrivateRoute>} />
      <Route path="/staff/guest-requests" element={<PrivateRoute><GuestRequests /></PrivateRoute>} />
      <Route path="/staff/room-status" element={<PrivateRoute><RoomStatusBoard /></PrivateRoute>} />
      <Route path="/staff/tasks" element={<PrivateRoute><TaskManagement /></PrivateRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
