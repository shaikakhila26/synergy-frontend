import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Fallback initials avatar as SVG
function defaultAvatar(nameOrEmail) {
  if (!nameOrEmail) return "";
  const initials = nameOrEmail
    .split(" ")
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="100%" height="100%" fill="#6667AB"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="32" fill="white" font-family="Arial, sans-serif">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function UserProfile({user,setUser}) {
  
 
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "available");
  const [statusMessage, setStatusMessage] = useState(user?.status_message || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef();

  // Fetch current user from Supabase session
 


  // Handle Supabase logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // Handle avatar upload to Supabase Storage
  const handleAvatarChange = async e => {
  const file = e.target.files[0];
  if (!file || !user) return;
  setLoading(true);

  console.log("Uploading avatar for user:", user.id, "File:", file);

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  console.log("Generated file path:", filePath);

  try {
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    console.log("Upload data:", data);
    console.log("Upload error:", uploadError);

    if (uploadError) {
      showToast("Avatar upload failed: " + uploadError.message);
      setLoading(false);
      return;
    }

    // Get public URL
    const { data: publicData, error: publicError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    console.log("Public URL data:", publicData, "Error:", publicError);

    if (!publicData?.publicUrl) {
      showToast("Failed to get avatar URL");
      setLoading(false);
      return;
    }

    const newAvatarUrl = publicData.publicUrl + `?t=${Date.now()}`;
    setAvatarUrl(newAvatarUrl);

    // Update users table immediately
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user.id);

    if (updateError) {
      showToast("Failed to save avatar in profile: " + updateError.message);
      console.error("Update avatar error:", updateError);
    } else {
      showToast("Avatar uploaded and saved!");
      // Optionally update local user object
      setUser({ ...user, avatar_url: newAvatarUrl });
    }

  } catch (err) {
    console.error("Avatar upload exception:", err);
    showToast("Something went wrong during upload.");
  } finally {
    setLoading(false);
  }
};


  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({ name, avatar_url: avatarUrl, status, status_message: statusMessage })
        .eq("id", user.id);

      if (error) showToast("Failed to update profile: " + error.message);
      else showToast("Profile updated!");
    } catch (err) {
      console.error("Profile save error:", err);
      showToast("Something went wrong while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    console.log("Toast:", message);
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{
      maxWidth: 420,
      margin: "2rem auto",
      background: "#F5D5E0",
      padding: "2rem",
      borderRadius: 18,
      position: "relative"
    }}>
      <h2 style={{ color: "#7B337E", marginBottom: 20 }}>User Profile</h2>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
        <img
          src={avatarUrl || defaultAvatar(name || user.email)}
          alt="avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            marginRight: 20,
            border: '3px solid #6667AB',
            objectFit: "cover"
          }}
          onError={e => { e.target.src = defaultAvatar(name || user.email); }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          aria-label="Upload Avatar"
          style={{
            border: 'none',
            background: '#6667AB',
            color: '#fff',
            borderRadius: 6,
            padding: '0.4em 1em',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Upload Avatar
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: "bold" }}>Email:</label>
        <input
          value={user.email}
          disabled
          style={{
            width: "95%",
            padding: "0.5em",
            margin: "6px 0",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#eee",
            color: "#666"
          }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: "bold" }}>Name:</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          style={{ width: "95%", padding: "0.5em", margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: "bold" }}>Status:</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ width: "95%", padding: "0.5em", margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="do_not_disturb">Do Not Disturb</option>
          <option value="be_right_back">Be right back</option>
          <option value="appear_away">Appear away</option>
          <option value="appear_offline">Appear offline</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: "bold" }}>Status Message:</label>
        <input
          value={statusMessage}
          onChange={e => setStatusMessage(e.target.value)}
          placeholder="Status message"
          style={{ width: "95%", padding: "0.5em", margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          disabled={loading}
          onClick={handleSave}
          style={{ background: "#7B337E", color: "#fff", padding: "0.7em 2em", border: "none", borderRadius: 7, fontWeight: 700 }}
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={logout}
          style={{ background: "#420D4B", color: "#fff", padding: "0.6em 1.5em", border: "none", borderRadius: 7, fontWeight: 700 }}
        >
          Log out
        </button>
      </div>

      {toast && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#6667AB",
          color: "#fff",
          padding: "0.6em 1.2em",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
