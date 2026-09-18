import "./Navbar.css";
import { Award, ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="brand">
          <div className="brand-logo">
            <Award size={22} />
          </div>

          <div>
            <h2>Certify</h2>
            <p>Certificate Portal</p>
          </div>
        </div>

        <a href="/admin/login" className="admin-button">
          <ShieldCheck size={17} />
          Admin Portal
        </a>

      </div>
    </nav>
  );
}

export default Navbar;