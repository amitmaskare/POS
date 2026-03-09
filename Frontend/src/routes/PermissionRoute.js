import { Navigate } from "react-router-dom";
import { getUser } from "../utils/Auth.js";


const PermissionRoute = ({ children, permission }) => {
  const user = getUser();
  console.log(user)
  if (!user) return <Navigate to="/login" />;

  if (!user.permissions.includes(permission))
    return <Navigate to="/unauthorized" />;

  return children;
};

export default PermissionRoute;
