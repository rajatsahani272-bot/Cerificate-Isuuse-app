import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminNavbar from "./pages/Admin/AdminNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/User/Home";
import Certificate from "./pages/User/Certificate";

import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import Teams from "./pages/Admin/Teams";
import Hackathons from "./pages/Admin/Hackathons";
import Participants from "./pages/Admin/Participants";
import Winners from "./pages/Admin/Winners";
import Templates from "./pages/Admin/Templates";
import Certificates from "./pages/Admin/Certificates";

function Layout() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin") &&
    location.pathname !== "/admin/login";

  if (isAdminPage) {
    return (
      <div className="admin-layout">
        <AdminNavbar />

        <div className="admin-content">
          <Routes>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/hackathons"
              element={
                <ProtectedRoute>
                  <Hackathons />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/teams"
              element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/participants"
              element={
                <ProtectedRoute>
                  <Participants />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/winners"
              element={
                <ProtectedRoute>
                  <Winners />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute>
                  <Certificates />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/certificate"
          element={<Certificate />}
        />

        <Route
          path="/admin/login"
          element={<Login />}
        />
      </Routes>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;