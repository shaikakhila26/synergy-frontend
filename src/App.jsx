// App.jsx
import  { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import About from "./pages/About";
import LoginPage from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import { supabase } from "./supabaseClient";
import { useAuth , AuthProvider } from "./AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ChatLayout from "./components/Chat/ChatLayout.jsx";
import TaskBoardLayout from "./components/TaskBoard/TaskBoardLayout.jsx";
import { PresenceProvider } from "./context/PresenceProvider.jsx";
import { NotificationsProvider } from "./context/NotificationsProvider.jsx";
import JoinWorkspace from "./pages/JoinWorkspace.jsx";

function ProtectedRoute({ children }) {
  const { user, authChecked } = useAuth();
 
  console.log("ProtectedRoute user:", user, "authChecked:", authChecked);
  if (!authChecked) {
  return (
    <div style={{
      color: "black",                          // Pick high-contrast text
      backgroundColor: "#F5D5E0",              // Use one of your branded colors
      textAlign: "center",
      marginTop: "3rem", 
      padding: "4rem",
      fontWeight: "bold",
      fontSize: "2rem",
    }}>
      Loading Synergy Dashboard authentication...
    </div>
  );
}

  if(!user){
    return <Navigate to="/login" replace />;
}
// Only check email_confirmed_at for password/email logins
  if (user?.app_metadata?.provider === "email" && !user.email_confirmed_at) {
    return <Navigate to="/login" replace />;
  }
return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
     
        <SocketProvider>
           <WorkspaceProvider>
            <PresenceProvider>
             <NotificationsProvider>
        {console.log("Inside AuthProvider")}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark"/>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/join/:token" element={<JoinWorkspace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WorkspaceDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskBoardLayout />
            </ProtectedRoute>
          } 
        />
        
      </Routes>
       </NotificationsProvider>
       </PresenceProvider>
      </WorkspaceProvider>
      </SocketProvider>
     
  
      </AuthProvider>
      
    </Router>
  );
}

export default App;
