import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Activity,
  Bell,
  BarChart3,
} from "lucide-react";

function Sidebar() {
  const links = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Containers",
      path: "/containers",
      icon: Package,
    },
    {
      name: "Add Container",
      path: "/containers/new",
      icon: PlusCircle,
    },
    {
      name: "Live Monitoring",
      path: "/monitoring",
      icon: Activity,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: Bell,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="logo-section">
        <div className="logo-icon">
          R
        </div>

        <div>
          <h2>ResQ-TAG</h2>
          <span>Smart Food Monitoring</span>
        </div>
      </div>

      <nav className="navigation">

        <p className="nav-title">
          MAIN MENU
        </p>

        {links.map((link) => {

          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <Icon size={19} />
              <span>{link.name}</span>
            </NavLink>
          );

        })}

      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>System Online</strong>
            <small>Sensor network active</small>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;