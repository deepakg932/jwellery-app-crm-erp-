import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If NO login → go to Landing
  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedRoute;
