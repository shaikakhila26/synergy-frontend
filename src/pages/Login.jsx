import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "../AuthProvider";


// ————— THEMES (COLORS) —————
const COLORS = {
  light: "#F5D5E0",
  blue: "#6667AB",
  purple: "#7B337E",
  dark: "#420D4B",
  deepest: "#210635",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px);}
  to { opacity: 1; transform: translateY(0);}
`;
const floatLogos = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.82; }
  55% { transform: translateY(-20px) rotate(6deg); opacity: 1; }
`;

// Global Styles
const GlobalStyle = createGlobalStyle`
  html, body, #root {
    min-height: 100vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  body {
    background: linear-gradient(135deg, ${COLORS.purple} 10%, ${COLORS.blue} 100%);
    font-family: 'Poppins', Arial, sans-serif;
    box-sizing: border-box;
  }
  * { box-sizing: inherit; }
`;

const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.purple} 100%);
`;

const LeftPanel = styled.div`
  flex: 1.13;
  min-width: 350px;
  background: ${COLORS.deepest};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 5rem;
  color: white;
  @media (max-width: 950px) { display: none; }
`;

const Tagline = styled.p`
  font-size: 1.19rem;
  font-weight: 600;
  color: ${COLORS.light};
  margin-bottom: 1.0rem;
`;

const InfoText = styled.p`
  font-size: 1.13rem;
  color: ${COLORS.light}cc;
  max-width: 370px;
  line-height: 1.6;
  margin-bottom: 2.2rem;
`;

const RightPanel = styled.div`
  flex: 1;
  min-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  background: ${COLORS.deepest}db;
  border-radius: 2rem;
  max-width: 415px;
  width: 100%;
  padding: 2.1rem 2.2rem;
  box-shadow: 0 8px 34px 9px ${COLORS.deepest}30;
  display: flex;
  flex-direction: column;
  z-index: 2;
  animation: ${fadeIn} 0.7s ease;
`;

const FormTitle = styled.h2`
  color: ${COLORS.light};
  font-size: 2.12rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1.7rem;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.33rem;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${COLORS.light};
  font-size: 1.22rem;
`;

const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.8px solid ${COLORS.light}ac;
  padding: 0.97rem 1rem 0.97rem 2.7rem;
  font-size: 1.13rem;
  color: ${COLORS.light};
  outline: none;
  font-weight: 600;
`;

const LogoBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
`;

const SmallLogo = styled.img`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  opacity: 0.78;
  animation: ${floatLogos} ${({ $duration }) => $duration}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  filter: drop-shadow(0 4px 10px #6667ab66);
  pointer-events: none;
`;

const scatteredLogos = Array.from({ length: 20 }).map((_, i) => ({
  top: Math.random() * 84 + "%",
  left: Math.random() * 85 + "%",
  size: 40 + Math.random() * 60,
  duration: 5.8 + Math.random() * 4.6,
  delay: Math.random() * 2,
}));
const PrimaryButton = styled.button`
  width: 100%;
  background: linear-gradient(92deg, ${COLORS.blue} 66%, ${COLORS.light});
  color: ${COLORS.deepest};
  border: none;
  border-radius: 1.87rem;
  padding: 1.05rem 0;
  font-size: 1.14rem;
  font-weight: 700;
  margin: 1.45rem 0 0.82rem 0;
  cursor: pointer;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  color: ${COLORS.light};
  font-size: 1rem;
  margin: 1.6rem 0;
  font-weight: 500;
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${COLORS.light}77;
  }
  &::before { margin-right: 0.8em; }
  &::after { margin-left: 0.8em; }
`;

const GoogleButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.69rem;
  background: white;
  color: ${COLORS.deepest};
  border: none;
  border-radius: 2rem;
  padding: 0.92rem 0;
  font-size: 1.11rem;
  font-weight: 700;
  cursor: pointer;
`;

const FooterText = styled.p`
  margin-top: 1.36rem;
  color: ${COLORS.blue};
  font-size: 1rem;
  text-align: center;
`;

const FooterLink = styled.a`
  color: ${COLORS.light};
  text-decoration: none;
  margin-left: 0.3rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const ForgotLink = styled.button`
  display: block;
  text-align: right;
  background: none;
  border: none;
  color: ${COLORS.blue};
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: -0.65rem;
  margin-bottom: 1.2rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

export default function Login() {
  const navigate = useNavigate();
  const { user ,setUser, authChecked } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Redirect if user is already logged in
 /* useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  */

  useEffect(() => {
    if (authChecked && user) {
      console.log("WorkspaceDashboard useAuth user:", user, "authChecked:", authChecked);
      console.log("User is already logged in, redirecting to dashboard.");
      navigate("/dashboard" , {replace:true} );
    }
  }, [authChecked ,user, navigate]);

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting login with:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Login response:", data, error);
      if (error) {
        if (error.message.includes("Email not confirmed")) {
            console.log("Email not confirmed error:", error);
          toast.info("Please confirm your email before logging in.");
        } else {
          
          toast.error(error.message);
        }
        console.log("Login error:", error);
        setLoading(false);
        return;
      }
     // Get the updated session
    if(data?.user){
      setUser(data.user);
      toast.success("Login successful!");
      console.log("User logged in:", data.user);
      navigate("/dashboard",{replace:true});
      }
    } catch (err) {
      console.error(err);
      console.log("Unexpected error during login:", err);
      toast.error("Something went wrong!");
    }
    finally{
      setLoading(false);
    }
  };

 

  // Google login
  const handleGoogleLogin = async () => {
    try {
     const {error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if(error){ console.log("Google login error:", error); }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed!");
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
        console.log("Email is required for password reset.");
      toast.info("Please enter your email first.");
      return;
    }
    console.log("Initiating password reset for:", email);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      console.log("Password reset response:", data, error);
      if (error) {
        console.log("Password reset error:", error);
        toast.error(error.message || "Failed to send reset email.");
        return;
      }

      toast.success("Check your email for reset instructions!");
      console.log("Password reset email sent successfully.");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err.message || "Something went wrong.");
    }
  };

  return (
    <>
      <GlobalStyle />
      
      <PageWrapper>
        <LeftPanel>
            <LogoBackground>     {scatteredLogos.map((logo, i) => (       <SmallLogo         key={i}         src="/logo.png"         $size={logo.size}         $duration={logo.duration}         $delay={logo.delay}         alt="logo"         draggable="false"         style={{ top: logo.top, left: logo.left }}       />     ))}   </LogoBackground>
          <Tagline>Welcome back 👋</Tagline>
          <InfoText>
            Log in to access your real-time documents, calls, whiteboards and team tasks.
          </InfoText>
        </LeftPanel>
        <RightPanel>
          <FormContainer>
            <FormTitle>Login</FormTitle>
            <form onSubmit={handleLogin}>
              <InputGroup>
                <InputIcon><IoMailOutline /></InputIcon>
                <Input
                  type="email"
                   name="email"

                  autoComplete="username"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
              <InputGroup>
                <InputIcon><IoLockClosedOutline /></InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute",
                    right: "1.1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: COLORS.light,
                    fontSize: "1.27rem",
                    padding: 0,
                  }}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </InputGroup>

              <ForgotLink type="button" onClick={handleForgotPassword}>
                Forgot Password?
              </ForgotLink>

              <PrimaryButton type="submit">Login</PrimaryButton>
              <Divider>or</Divider>
              <GoogleButton type="button" onClick={handleGoogleLogin}>
                <FcGoogle size={22} /> Login with Google
              </GoogleButton>
              <FooterText>
                Don’t have an account?
                <FooterLink onClick={() => navigate("/signup")}>
                  Sign Up
                </FooterLink>
              </FooterText>
            </form>
          </FormContainer>
        </RightPanel>
      </PageWrapper>
    </>
  );
}
