import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminApp from "./pages/AdminApp";
import Login from "./components/Login";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogin = (token: string) => {
    localStorage.setItem("token", token);
    window.location.href = "/admin";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />

        <Route
          path="/admin/*"
          element={
            isAuthenticated ? <AdminApp /> : <Navigate to="/login" replace />
          }
        />

        <Route path="/" element={<Navigate to="/admin" />} />

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
