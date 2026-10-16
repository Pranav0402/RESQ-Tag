import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Containers from "./pages/Containers";
import AddContainer from "./pages/AddContainer";
import ContainerDetails from "./pages/ContainerDetails";
import Monitoring from "./pages/Monitoring";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";


function Placeholder({ title }) {
  return (
    <div className="dashboard-card">

      <h1>{title}</h1>

      <p>
        This module will be implemented next.
      </p>

    </div>
  );
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          element={<Layout />}
        >

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/containers"
            element={<Containers />}
          />

          <Route
            path="/containers/new"
            element={<AddContainer />}
          />

          <Route
            path="/containers/:id"
            element={<ContainerDetails />}
          />

          <Route
            path="/monitoring"
            element={<Monitoring />}
          />

          <Route
            path="/alerts"
            element={
              <Alerts />
            }
          />

          <Route
            path="/analytics"
            element={
              <Analytics />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;