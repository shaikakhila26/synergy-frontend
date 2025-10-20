import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { MdPassword } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../supabaseClient";

// Color palette
const COLORS = {
  light: "#F5D5E0",
  blue: "#6667AB",
  purple: "#7B337E",
  dark: "#420D4B",
  deepest: "#210635",
};

const fadeInCard = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(20px);}
  to { opacity: 1; transform: scale(1) translateY(0);}
`;

const btnHover = keyframes`
  0% { transform: scale(1);}
  50% { transform: scale(1.045);}
  100% { transform: scale(1);}
`;

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    min-height: 100vh;
    margin: 0; padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(135deg, ${COLORS.purple} 10%, ${COLORS.blue} 100%);
    box-sizing: border-box;
  }
  * { box-sizing: inherit; }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(33,6,53, 0.9);
  padding: 2.8rem 2.5rem;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 40px #210635cc;
  animation: ${fadeInCard} 0.6s cubic-bezier(.43,.09,.52,1.02) forwards;
  color: ${COLORS.light};
  position: relative;
`;

const FormTitle = styled.h2`
  text-align: center;
  font-weight: 700;
  margin-bottom: 1.4rem;
  color: ${COLORS.light};
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 2.2rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%; left: 1rem;
  transform: translateY(-50%);
  color: ${COLORS.blue};
  font-size: 1.17rem;
  pointer-events: none;
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.15rem;
  color: ${COLORS.blue};
  cursor: pointer;
  z-index: 5;
  transition: color 0.2s;
  &:hover { color: ${COLORS.purple}; }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 2.8rem 0.7rem 3rem;
  border-radius: 8px;
  border: 1.7px solid ${COLORS.purple};
  font-size: 1.08rem;
  background-color: rgba(120, 51, 126, 0.17);
  color: ${COLORS.light};
  outline: none;
  box-shadow: 0 2px 15px #21063522;
  transition: border-color 0.24s, background-color 0.24s;
  &::placeholder { color: ${COLORS.blue}aa; font-weight: 400; }
  &:focus { border-color: ${COLORS.blue}; background-color: #4A3F7D; }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, ${COLORS.purple}, ${COLORS.blue});
  border: none;
  padding: 0.8rem 0;
  border-radius: 10px;
  color: white;
  font-weight: 700;
  font-size: 1.11rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: background 0.2s, box-shadow 0.15s;
  box-shadow: 0 2px 4px #21063555;
  &:hover, &:focus-visible {
    animation: ${btnHover} 0.28s ease-in;
    background: linear-gradient(91deg, ${COLORS.blue}, ${COLORS.purple});
    box-shadow: 0 2px 13px #21063555;
  }
  &:disabled { background: ${COLORS.dark}; cursor: not-allowed; box-shadow: none; }
`;

const SecondaryButton = styled.button`
  width: 100%;
  background: none;
  border: 1.5px solid ${COLORS.blue};
  color: ${COLORS.blue};
  padding: 0.7rem 0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.03rem;
  margin-top: 0.7rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  &:hover, &:focus-visible {
    background: rgba(102,103,171,0.12);
    border-color: ${COLORS.purple};
  }
`;

const InfoText = styled.p`
  text-align: center;
  color: #ffb8b8;
  font-weight: 500;
  margin-top: 1rem;
  font-size: 0.98rem;
`;

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Extract recovery tokens from URL hash
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("access_token");
    const refresh = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (token && refresh && type === "recovery") {
      setValid(true);
      setAccessToken(token);
      setRefreshToken(refresh);
      sessionStorage.setItem("supabase_recovery_token", token);
      sessionStorage.setItem("supabase_recovery_refresh", refresh);
    } else {
      // 2️⃣ Fallback from sessionStorage
      const tokenStored = sessionStorage.getItem("supabase_recovery_token");
      const refreshStored = sessionStorage.getItem("supabase_recovery_refresh");
      if (tokenStored && refreshStored) {
        setValid(true);
        setAccessToken(tokenStored);
        setRefreshToken(refreshStored);
      } else {
        toast.error("Invalid or expired password reset link.");
      }
    }
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!accessToken) return toast.error("Invalid reset link.");

    try {
      // 1️⃣ Set session using recovery token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) return toast.error(sessionError.message);

      // 2️⃣ Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return toast.error(error.message);

      // Success
      toast.success("Password updated successfully!");
      sessionStorage.removeItem("supabase_recovery_token");
      sessionStorage.removeItem("supabase_recovery_refresh");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <GlobalStyle />
      <ToastContainer position="top-center" autoClose={5000} />
      <Wrapper>
        <Card>
          <FormTitle>
            <MdPassword style={{ marginRight: 7, fontSize: "1.7rem", color: COLORS.blue }} />
            Reset Password
          </FormTitle>

          {!valid ? (
            <InfoText>
              Oops! This password reset link is invalid or expired.<br />
              Please request a new link to reset your password.
              <SecondaryButton onClick={() => navigate("/login")}>Request a New Link</SecondaryButton>
            </InfoText>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <InputGroup>
                <InputIcon><MdPassword /></InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                />
                <EyeIcon onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </EyeIcon>
              </InputGroup>

              <SubmitButton type="submit">Update Password</SubmitButton>
              <SecondaryButton type="button" onClick={() => navigate("/login")}>
                Request a New Link
              </SecondaryButton>
            </form>
          )}
        </Card>
      </Wrapper>
    </>
  );
}
