import { getToken } from "@/utils";
import { Navigate } from "react-router-dom";
function AuthComponent({ children }) {
  const isToken = getToken();
  if (isToken){
    return <>{children}</>
  }else{
    return <Navigate to="/login" />
  }
}

export {
    AuthComponent
}