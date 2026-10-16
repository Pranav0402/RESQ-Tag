import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, UserCircle } from "lucide-react";

function Layout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-area">

        <header className="topbar">

          <div>
            <h3>Container Monitoring</h3>
            <p>
              Real-time food freshness monitoring
            </p>
          </div>

          <div className="topbar-actions">

            <button className="icon-button">
              <Bell size={20} />
            </button>

            <div className="user-profile">
              <UserCircle size={34} />

              <div>
                <strong>Admin</strong>
                <span>Project Manager</span>
              </div>
            </div>

          </div>

        </header>

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default Layout;