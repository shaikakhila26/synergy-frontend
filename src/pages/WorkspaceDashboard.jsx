import React, { useState, useEffect, use } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import WorkspaceList from "../components/features/WorkspaceList";
import ChatRoom from "../components/features/ChatRoom";
import TaskBoard from "../components/features/TaskBoard";
import DocumentEditor from "../components/features/DocEditor";
import VideoCall from "../components/features/VideoCall";
import Whiteboard from "../components/features/Whiteboard";
import Calendar from "../components/features/Calendar";
import ActivityFeed from "../components/features/ActivityFeed";
import FileManager from "../components/features/FileManager";
import UserProfile from "../components/features/UserProfile";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { SocketProvider } from "../context/SocketContext.jsx";
import { WorkspaceProvider , useWorkspace } from "../context/WorkspaceContext.jsx";
import ChatSidebar from "../components/Chat/ChatSidebar.jsx";
import NotificationBell from "../components/NotificationBell.jsx";


// -- Style setup
const COLORS = { pink: "#F5D5E0", blue: "#6667AB", purple: "#7B337E", dark: "#420D4B", deepest: "#210635" };

const GlobalStyle = createGlobalStyle`
  body, #root { min-height: 100vh; margin: 0; font-family: 'Poppins', Arial, sans-serif; }
`;

const DashboardLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(150deg, #6667AB22 0%, #F5D5E0 80%);
`;

const MainPanel = styled.div`
  flex: 1;
  padding: 2.5rem 1.8rem 1.2rem 2rem;
  background: linear-gradient(135deg, #F5D5E0 70%, white 100%);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  background: transparent;
`;

function defaultAvatar(nameOrEmail) {
  if (!nameOrEmail) return "";
  const initials = nameOrEmail
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="100%" height="100%" fill="#6667AB"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-size="20" fill="white" font-family="Arial, sans-serif">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}





export default function WorkspaceDashboard() {
  const { user , authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState("workspaces");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  //const [selectedDocument, setSelectedDocument] = useState(null);
 // const [documents, setDocuments] = useState([]);
  //const { activeWorkspace } = useWorkspace(); // Current workspace

  // 1️⃣ Fetch documents for the active workspace
  /*
  useEffect(() => {
    if (!activeWorkspace?.id) return;

    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("workspace_id", activeWorkspace.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return;
      }
      setDocuments(data);
    };

    fetchDocuments();
  }, [activeWorkspace]);

  // 2️⃣ Create a new document
  const createDocument = async () => {
    if (!user?.id || !activeWorkspace?.id) return;

    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          title: "Untitled Document",
          owner_id: user.id,
          workspace_id: activeWorkspace.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to create document:", error);
      return;
    }

    setDocuments((prev) => [data, ...prev]);
    setSelectedDocument(data); // auto-select new document
  };*/


  // Only fetch profile when user is available
  useEffect(() => {
   
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      //optional : wait a short time to ensure loading is done

      await new Promise(res => setTimeout(res, 300));
      setLoadingProfile(true);
      try {
        console.log("Fetching profile for user ID:", user.id);
        const { data: profileData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Fetch user profile error:", error);
          setProfile(null);
          return;
        }

        setProfile(profileData);
        console.log("Fetched user profile:", profileData);
      } catch (err) {
        console.error("fetchUserProfile exception:", err);
        setProfileError("Failed to load profile:" + err.message);
        //setProfile(null);
      }
      finally{
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();

    if (!profile && user?.id) {
  setTimeout(fetchUserProfile, 200); // retry after 200ms
}

  }, [user]);



  // Use profile or fallback to user for initials/avatar
  const initialsSource = profile?.name || user?.email || "";
 

   if(!authChecked){
    return <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>Loading authnetication status...</div>;
  }   
  if(!user){
    return <Navigate to="/login" replace />;
  }
  // Only check email_confirmed_at for password/email logins
  if (user?.app_metadata?.provider === "email" && !user.email_confirmed_at) {
    return <Navigate to="/login" replace />;
  }

  if(loadingProfile){
    return <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>Loading profile...</div>;
  }

  if (profileError)
    return (
      <div
        style={{ color: "red", textAlign: "center", marginTop: "3rem" }}
      >
        Error loading profile: {profileError}
      </div>
    );

   // if (!activeWorkspace) return <div>Select a workspace</div>;
  return (
    <>
      <GlobalStyle />
      
      <DashboardLayout>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainPanel>
          <Header>
            <img src="/logo.png" alt="Synergy Logo" style={{ height: 80 }} />
            <div style={{ display: "flex", alignItems: "center" }}>
              <NotificationBell /> 
              <div
                style={{ cursor: "pointer", marginLeft: "1rem" }}
                onClick={() => setActiveTab("settings")}
              >
                <img
                  src={profile?.avatar_url || defaultAvatar(initialsSource)}
                  alt={profile?.name || "User Avatar"}
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar(initialsSource);
                  }}
                />
              </div>
            </div>
          </Header>

          {activeTab === "workspaces" && <WorkspaceList />}
          {activeTab === "chat" && (
            <div style={{ display: 'flex', gap: 12 }}>
              <ChatSidebar /><ChatRoom />
              </div>
          )}
          {activeTab === "tasks" && <TaskBoard />}
          {activeTab === "docs" && (
    
          <DocumentEditor  userName={user?.email || "Anonymous"}
          />
      
      )}
   
  

          {activeTab === "video" && <VideoCall />}
          {activeTab === "whiteboard" && <Whiteboard />}
          {activeTab === "calendar" && <Calendar />}
          {activeTab === "activity" && <ActivityFeed />}
          {activeTab === "files" && <FileManager />}
          {activeTab === "settings" && <UserProfile user={profile} setUser={setProfile} />}
        </MainPanel>
      </DashboardLayout>
     
    </>
  );
}
