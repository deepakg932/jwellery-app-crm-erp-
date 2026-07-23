import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  // If NO login → go to Landing
  if (!token) {
    return <Navigate to="/landing" replace />;
  }
  // if(token){
  //       return <Navigate to="/dashboard" replace />;
  // }

  return children;
};

export default ProtectedRoute;
