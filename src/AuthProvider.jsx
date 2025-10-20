import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";


const AuthContext = createContext();
console.log("AuthContext created:", AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    /*const initAuth = async () => {
      try{
        console.log("Initializing auth...");
      
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session on init:", session);
        if (!mounted) return;

        console.log("got session:", session);
        if(mounted) {
        if (session?.user) {
          console.log("Session has user , ensuring user exists in table", session.user);
          await ensureUserInTable(session.user);
        }
        setUser(session?.user || null);
        setAuthChecked(true);
        console.log("Auth state updated : user set , authchecked true");
        console.log("AuthProvider updated state: user =", session?.user, ", authChecked = true");
      } 
    }
    catch(err){
      console.error("Error during initAuth:", err);
    }
  };*/

  const initAuth = async () => {
  try {
    console.log("Starting getSession...");
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log("Session on init:", session, "error:", error);
    if (!mounted) return;

    if (session?.user) {
      setUser(session.user);
      setAuthChecked(true);
      console.log("Auth state updated after init: user set, authchecked true");

      // Run DB ensure in background
    //  ensureUserInTable(session.user).catch((err) => {
       // console.error("Error ensuring user in table during init:", err);
//      });
    } else {
      setUser(null);
      setAuthChecked(true);
    }
  } catch (err) {
    console.error("Error during initAuth:", err);
    setAuthChecked(true); // Prevent indefinite loading if something breaks
  }
};


    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", _event, session);
      if (_event === "SIGNED_IN" &&session?.user) {
       // if(_event !== "INITIAL_SESSION"){
     //     console.log("New session user after auth state change, ensuring user exists in table", session.user);
     //     await ensureUserInTable(session.user);
     //   }
        setUser(session.user);
        setAuthChecked(true);
        console.log("Auth state updated after change: user set , authchecked true");

         // Run this in the background (non-blocking)
    if (_event !== "INITIAL_SESSION" || _event === "USER_UPDATED") {
      ensureUserInTable(session.user).catch((err) => {
        console.error("Error ensuring user in table:", err);
      });
      }
    }
      if(_event === "SIGNED_OUT"){
        setUser(null);
      
      }
        setAuthChecked(true);
    
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log("Cleaned up auth subscription");
    };
  }, []);

  const ensureUserInTable = async (user) => {
    try {

        if(!user?.id) return;
      console.log("Ensuring user exists in 'users' table:", user.id);
      
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking existing user:", selectError);
        return;
      }

      if (!existingUser) {
        // For Google users, optionally wait until they complete signup/profile
      if (user.app_metadata?.provider === "google") {
        console.log("Google OAuth user detected — inserting user now.");
      }
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
        console.log("User not found in table, inserting:", user.id, name);
        const { error: insertError } = await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
          name: name,
        },
        { onConflict: ['id'] }
      );

        if (insertError) console.error("Error inserting user:", insertError.message);
        else console.log("User inserted successfully",user.id);
        console.log("Inserting user:", { id: user.id, email: user.email, name });

      }
      else {
        console.log("User already exists in 'users' table:", user.id);
      }
    } catch (err) {
      console.error("ensureUserInTable error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

console.log("AuthContext identity:", AuthContext);

export function useAuth() {
  return useContext(AuthContext);
}
