import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ————— THEMES & ANIMATIONS —————
const COLORS = {
  light: "#F5D5E0",
  blue: "#6667AB",
  purple: "#7B337E",
  darkPurple: "#4C1C52",
  deepest: "#210635",
  pink: "#E8D8F0",
  accent: "#A73AEC",
  imagePurple: "#7A35A5",

  imageLightBlue: "#6B9CB3",
};

const softGlow = keyframes`

  0% { opacity: 0.9; transform: translate(0, 0) scale(1); }

  50% { opacity: 1; transform: translate(2px, 2px) scale(1.02); }

  100% { opacity: 0.9; transform: translate(0, 0) scale(1); }

`;


const slideIn = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    min-height: 100vh;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  body {
    background: linear-gradient(135deg, ${COLORS.purple} 10%, ${COLORS.blue} 100%);
    font-family: 'Poppins', sans-serif;
    box-sizing: border-box;
  }
  * { box-sizing: inherit; }
`;

// ——— Styled Components ———
const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(180deg, ${COLORS.imagePurple}, ${COLORS.imageLightBlue});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
  text-align: center;
`;

const RightPanel = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: ${slideIn} 0.8s ease;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const LogoCircle = styled.div`
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px #00000033;
  margin-bottom: 1rem;
`;

const LogoText = styled.h1`
  font-weight: 800;
  letter-spacing: 2px;
  color: white;
  margin: 0;
`;

const Tagline = styled.h2`
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const InfoText = styled.p`
  max-width: 300px;
  margin: 1rem auto;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const OutlineButton = styled.button`
  border: 2px solid white;
  background: transparent;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  &:hover {
    background: white;
    color: ${COLORS.darkPurple};
  }
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px #00000033;
  max-width: 400px;
  width: 100%;
  backdrop-filter: blur(12px);
`;

const FormTitle = styled.h2`
  text-align: center;
  color: white;
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${COLORS.pink};
  font-size: 1.2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  &::placeholder { color: rgba(255, 255, 255, 0.7); }
`;

const GlassButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, ${COLORS.purple}, ${COLORS.accent});
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  &:hover { opacity: 0.9; transform: translateY(-2px); }
  
`;

const Divider = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin: 1rem 0;
  font-size: 0.8rem;
  position: relative;
  &::before, &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
  }
  &::before { left: 0; }
  &::after { right: 0; }
`;

const GoogleButton = styled.button`
  width: 100%;
  background: white;
  color: #333;
  padding: 0.7rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background: #f2f2f2; }
`;

const FooterText = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 1rem;
`;

const FooterLink = styled.a`
  color: white;
  font-weight: 600;
  margin-left: 0.3rem;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

// ——— COMPONENT ———
export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Signing up with email:", email);

    try{
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,  // after email confirmation
      },
    });

    

    if (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    console.log("Signup data:", data);

    // 2️⃣ Insert into "users" table if signup succeeded
    if (data?.user) {
      const { error: insertError } = await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.email.split("@")[0],
      });

         

      if (insertError) {
        console.error("Error inserting user into users table:", insertError.message);
        toast.error("Failed to save user details. Please try again.");
        setLoading(false);
        return;
      }
    }


    
toast.success("Check your email to confirm your signup.");
setSignedUp(true);
   // setTimeout(() => navigate("/login"), 1800); 
   
  }
  catch(err){
    console.error("Signup error:", err);
    toast.error("Signup failed. Please try again.");
  } 
  finally{
    setLoading(false);
  }
};

useEffect(() => { 
  if(signedUp){
    console.log("Navigating to login after signup");
   navigate("/login");
  } 
}, [signedUp, navigate]);


  /*
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: email.split("@")[0], email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed. Try again.", { position: "top-center" });
        setLoading(false);
        return;
      }

      if ("credentials" in navigator) {
        try {
          const cred = new PasswordCredential({ id: email, password, name: email.split("@")[0] });
          await navigator.credentials.store(cred);
        } catch (err) { console.error("Credential API error:", err); }
      }

      toast.success("Signup successful! Check your email to confirm.", { position: "top-center" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };*/

  const handleGoogleSignUp = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
    } catch (err) {
      console.error("Google signup error:", err);
      toast.error("Google signup failed");
    }
  };

  return (
    <>
      <GlobalStyle />
     
      <PageWrapper>
        <LeftPanel>
          <Logo>
            <LogoCircle>
              <img
                src="/logo.png"
                alt="Synergy Logo"
                style={{ width: "200%", height: "150%", objectFit: "contain", filter: "drop-shadow(0 4px 12px #21063599)" }}
              />
            </LogoCircle>
            <LogoText>SYNERGY</LogoText>
          </Logo>
          <Tagline>Real-time collaboration, all-in-one productivity</Tagline>
          <InfoText>Real-time docs, calls, whiteboards, tasks, and chat—unified for productive remote teams</InfoText>
          <OutlineButton onClick={() => navigate("/about")}>Learn More About Synergy</OutlineButton>
        </LeftPanel>

        <RightPanel>
          <FormContainer>
            <FormTitle>Create Account</FormTitle>
            <form onSubmit={handleEmailSignUp}>
              <InputGroup>
                <InputIcon><IoMailOutline /></InputIcon>
                <Input type="email"  name="email" placeholder="Work Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </InputGroup>
              <InputGroup>
                <InputIcon><IoLockClosedOutline /></InputIcon>
                <Input type={showPassword ? "text" : "password"} placeholder="Create Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                  position: "absolute", right: "1.1rem", top: "50%", transform: "translateY(-50%)",
                  border: "none", background: "none", cursor: "pointer", color: COLORS.pink, fontSize: "1.28rem", padding: 0
                }}>
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </InputGroup>

              <GlassButton type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</GlassButton>
              <Divider>or</Divider>
              <GoogleButton type="button" onClick={handleGoogleSignUp}><FcGoogle size={22} /> Sign up with Google</GoogleButton>
              <FooterText>
                Already have an account? <FooterLink href="/login">Log in</FooterLink>
              </FooterText>
            </form>
          </FormContainer>
        </RightPanel>
      </PageWrapper>
    </>
  );
}
