import React from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import FeatureGrid from "../components/feature/FeatureGrid";
import Absences from "../components/sections/Absences";
import HREssentials from "../components/sections/HREssentials";
import Onboarding from "../components/sections/Onboarding";
import Documents from "../components/sections/Documents";
import WhatsNew from "../components/sections/WhatsNew";
import SiteFooter from "../components/SiteFooter";

// Palette
const COLORS = {
  pink: "#F5D5E0",
  blue: "#6667AB",
  purple: "#7B337E",
  darkPurple: "#420D4B",
  deepest: "#210635",
};


const GlobalStyle = createGlobalStyle`
  // 💡 Using a more professional, modern font (Poppins)
  
  
  html, body, #root {
    min-height: 100vh;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  body {
    // 💡 Improved gradient for depth
    background: linear-gradient(135deg, ${COLORS.purple} 10%, ${COLORS.blue} 100%);
    font-family: 'Poppins', sans-serif;
    color: ${COLORS.pink};
    box-sizing: border-box;
  }
  * {
    box-sizing: inherit;
  }
`;

const Wrapper = styled.div`
  background: ${COLORS.pink};
  min-height: 100vh;
  font-family: 'Inter', Arial, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  padding: 3rem 0 2.5rem 0;
  background: linear-gradient(180deg, ${COLORS.pink} 60%, white 100%);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 900px;
  margin: 0 auto 1rem auto;
  padding: 0 1.5rem;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
`;

const LogoCircle = styled.div`
   background: radial-gradient(circle at 30% 30%, #fff6, ${COLORS.pink} 62%, ${COLORS.blue} 100%);
  color: ${COLORS.pink};
  border-radius: 50%;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  border: 2.5px solid ${COLORS.purple}55;
  box-shadow:
    0 4px 22px ${COLORS.blue}23,
    0 1.5px 10px ${COLORS.purple}18,
    0 0 0 6px #f5d5e045;  // Glass highlight "halo"
  backdrop-filter: blur(3px) saturate(132%);
  position: relative;
  &:hover {
  box-shadow:
    0 8px 34px ${COLORS.purple}32,
    0 0 0 12px #f5d5e045;
  transform: scale(1.07);
  transition: all 0.17s;
}

`;

const wave = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-2deg);
    color: ${COLORS.deepest};
    letter-spacing: -1.5px;
  }
  10% {
    transform: scale(1.08) rotate(2deg);
    color: ${COLORS.darkPurple};
    letter-spacing: 2px;
  }
  20%, 80% {
    transform: scale(1.03) rotate(-1deg);
    color: ${COLORS.darkPurple};
  }
  50% {
    color: ${COLORS.deepest};
    transform: scale(1.08) rotate(1deg);
    letter-spacing: 1.2px;
  }
`;


const rainbowAnimate = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const popBounce = keyframes`
  0%, 100% { transform: scale(1);}
  10% { transform: scale(1.13);}
  20%, 80% { transform: scale(1.04);}
  50% { transform: scale(1.15);}
`;

const colorSwipe = keyframes`
  0% { color: ${COLORS.deepest}; }
  30% { color: ${COLORS.purple}; }
  60% { color: ${COLORS.blue}; }
  100% { color: ${COLORS.deepest}; }
`;

const AppName = styled.h1`
  font-weight: 800;
  font-size: 2.4rem;
  letter-spacing: -1px;
  color: ${COLORS.deepest};
  animation: ${colorSwipe} 2.2s infinite;
  display: inline-block;
  span {
    color: ${COLORS.purple}; font-weight: 900;
    animation: ${colorSwipe} 2.2s infinite 0.33s;
    display: inline-block;
  }
`;






const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledButton = styled.a`
  font-weight: 700;
  font-size: 1rem;
  border-radius: 2rem;
  padding: 0.75rem 1.7rem;
  text-decoration: none;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;

const SignupButton = styled(StyledButton)`
  background: linear-gradient(90deg, ${COLORS.blue}, ${COLORS.pink});
  color: ${COLORS.deepest};
  &:hover {
    background: ${COLORS.purple};
    color: ${COLORS.pink};
  }
`;

const LoginButton = styled(StyledButton)`
  background: ${COLORS.deepest};
  color: ${COLORS.pink};
  &:hover {
    background: ${COLORS.darkPurple};
    color: ${COLORS.pink};
  }
`;

export default function Welcome() {
  return (
    <>
    <GlobalStyle />
    <Wrapper>
      <Header>
        <TopRow>
          <LogoArea>
            <LogoCircle>
                <img
    src="/logo.png"
    alt="Synergy Logo"
    style={{
      width: '200%',
      height: '150%',
        objectFit: 'contain',
      display: 'block',
      filter: 'drop-shadow(0 4px 12px #21063599)', // Makes the logo pop out of the circle
      zIndex: 2
      
    }}
  />
            </LogoCircle>
            <AppName>
  Syn
  <span style={{
    background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 900,
    display: "inline-block"
  }}>
    ergy
  </span>
</AppName>


          </LogoArea>
          <ButtonRow>
            <SignupButton href="/signup">Sign Up</SignupButton>
            <LoginButton href="/login">Log In</LoginButton>
          </ButtonRow>
        </TopRow>
        <p style={{ color: COLORS.purple, fontSize: "1.2rem", fontWeight: 500, marginBottom: 30 }}>
          Bring joy to your workplace.
        </p>
      </Header>
      <Onboarding />
      <Documents />
      <FeatureGrid />
      <Absences />
      <HREssentials />
      
      <WhatsNew />
      <SiteFooter />
    </Wrapper>
    </>
  );
}