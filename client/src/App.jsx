
import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import AuthPage from "./components/AuthPage.jsx";
function App() {
  const[user,setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw? JSON.parse(raw) : null;
  });

  function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }
  if(!user) return <AuthPage onAuth={setUser} />
  return (
    <>
      <Dashboard user={user} onLogout={logout}/>
    </>
  )
}

export default App
