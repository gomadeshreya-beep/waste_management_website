import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import AdminApproval from "./pages/AdminApproval";
import "./styles/theme.css";
import "./App.css";

function App() {
  const basename =
    window.location.hostname === "gomadeshreya-beep.github.io"
      ? "/waste_management_website"
      : "/";
  const isVerificationLink = new URLSearchParams(window.location.search).get("verify") === "1";
  const isAdminApprovalLink = new URLSearchParams(window.location.search).get("adminApproval") === "1";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={isAdminApprovalLink ? <AdminApproval /> : isVerificationLink ? <VerifyEmail /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* fallback so GitHub Pages doesn’t break */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
