import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Joining workspace...");

  useEffect(() => {
    const joinWorkspace = async () => {
      // ✅ 1. Get Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus("You must log in first. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // ✅ 2. Attach the access token
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/workspace/join-by-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ token }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("Successfully joined workspace! Redirecting...");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          setStatus(data.message || "Failed to join workspace");
        }
      } catch (err) {
        console.error("Join error:", err);
        setStatus("Something went wrong.");
      }
    };

    joinWorkspace();
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>{status}</p>
    </div>
  );
}
