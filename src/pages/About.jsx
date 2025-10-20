import React from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
// 💡 Importing professional icons from react-icons/io5 (Ionicons)
import { IoDocumentText, IoVideocam, IoBulb, IoCheckmarkDoneCircle, IoChatbubbles, IoShieldCheckmark } from 'react-icons/io5';


// ————— THEMES & ANIMATIONS —————

const COLORS = {
  // Refined palette for contrast and vibrancy
  accent: "#A73AEC", // Vibrant Purple/Pink for highlights (New)
  pink: "#E8D8F0", // Lighter text color
  blue: "#6667AB", 
  purple: "#7B337E", 
  darkPurple: "#4C1C52", // Richer, darker card background
  deepest: "#210635", 
};

// Keyframe for a subtle, engaging glow effect
const pulseShadow = keyframes`
  0% { box-shadow: 0 0 10px rgba(167, 58, 236, 0.1); }
  50% { box-shadow: 0 0 20px rgba(167, 58, 236, 0.4); }
  100% { box-shadow: 0 0 10px rgba(167, 58, 236, 0.1); }
`;


const GlobalStyle = createGlobalStyle`
  // 💡 Using a more professional, modern font (Poppins)
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&display=swap');
  
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
  min-height: 100vh;
  padding: 4rem 1rem;
`;

const Section = styled.section`
  max-width: 880px;
  margin: 0 auto;
  // 💡 Dark, rich background with a strong shadow for depth
  background: ${COLORS.deepest}; 
  border-radius: 2.5rem;
  padding: 4rem; 
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6); 
`;

const Heading = styled.h1`
  // 💡 Larger, bolder title
  color: #fff;
  font-size: 3.2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: -2px;
  text-align: center;
  
  // 💡 Custom Gradient Text for "Synergy"
  span {
    background: linear-gradient(45deg, ${COLORS.accent}, ${COLORS.pink});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block; 
  }
`;

const AboutText = styled.p`
    color: ${COLORS.pink}e0;
    font-size: 1.2rem;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
`;

const SubHeading = styled.h2`
  // 💡 Used the accent color for prominence
  color: ${COLORS.accent};
  font-size: 1.8rem;
  font-weight: 700;
  margin: 3.5rem 0 1.5rem 0;
  letter-spacing: -0.5px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
`;

const FeatureCard = styled.div`
  background: ${COLORS.darkPurple};
  border-radius: 1.5rem;
  padding: 2.5rem 1.8rem;
  color: ${COLORS.pink};
  display: flex;
  flex-direction: column;
  // 💡 Prominent border top using the accent color
  border-top: 5px solid ${({ accent }) => accent || COLORS.accent};
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  // 💡 Professional hover animation for engagement
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  }
`;

const IconContainer = styled.div`
    // 💡 Stylish, soft-glowing icon container
    color: ${COLORS.accent};
    font-size: 2.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 50%;
    background: ${COLORS.deepest}88;
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 15px ${COLORS.accent}22;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${COLORS.pink}; 
  margin-bottom: 0.5rem;
`;

const CardDesc = styled.p`
  font-size: 1rem;
  color: ${COLORS.pink}cc;
`;

const AboutList = styled.ul`
  margin: 1.7rem 0 0 0;
  padding: 0;
  color: ${COLORS.pink};
  list-style: none;
  font-size: 1.1rem;
  
  li {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    position: relative;
    
    // 💡 Custom bullet point using the accent color
    &::before {
        content: '•';
        color: ${COLORS.accent};
        font-size: 1.5em;
        position: absolute;
        left: 0;
        top: -4px;
    }
  }
`;

const Divider = styled.hr`
  border: none;
  // 💡 Divider uses the accent color with a subtle, pulsing glow
  border-bottom: 2px solid ${COLORS.accent}55;
  margin: 3.5rem auto 3rem;
  width: 150px;
  animation: ${pulseShadow} 3s infinite alternate;
`;

// Helper component for the Feature Card to include the icon
const FeatureItem = ({ icon: Icon, title, desc, accent }) => (
    <FeatureCard accent={accent}>
        <IconContainer>
            <Icon />
        </IconContainer>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{desc}</CardDesc>
    </FeatureCard>
);


// ————— THE PAGE —————
export default function About() {
  return (
    <>
    <GlobalStyle />
    
    <Wrapper>
      <Section>
        {/* 💡 Gradient Text Header */}
        <Heading>About  
            <span>
             <img
    src="/logo.png"
    alt="Synergy Logo"
    style={{
      width: '20%',
      height: '20%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
    }}
    />
      Synergy
      
    </span>
        </Heading>
        
        <AboutText>
          Synergy is a browser-based platform that empowers remote and hybrid teams with everything they need to work together productively. All your collaboration, communication, and project management tools are unified into a single, real-time suite.
        </AboutText>
        <Divider />

        <SubHeading>Platform Features</SubHeading>
        <FeatureGrid>
          
          {/* 💡 Components now use professional icons */}
          <FeatureItem 
            icon={IoDocumentText} 
            title="Live Document Collaboration" 
            desc="Edit documents in real time with teammates. Powered by cutting-edge CRDT technology for fast, reliable syncing—just like Google Docs, but fully integrated." 
            accent={COLORS.blue}
          />

          <FeatureItem 
            icon={IoVideocam} 
            title="Integrated Video Conferencing" 
            desc="Launch instant video or audio calls with peers or the whole team. Built on low-latency, secure WebRTC connections for smooth remote meetings." 
            accent={COLORS.pink}
          />

          <FeatureItem 
            icon={IoBulb} 
            title="Collaborative Whiteboarding" 
            desc="Brainstorm, sketch, and visually collaborate on an interactive whiteboard that syncs live across the group. Draw, annotate, and export ideas on the fly." 
            accent={COLORS.purple}
          />

          <FeatureItem 
            icon={IoCheckmarkDoneCircle} 
            title="Kanban Task Boards" 
            desc="Organize your work, assign tasks to team members, and track progress in real time with Kanban boards and effortless drag-and-drop." 
            accent={COLORS.darkPurple}
          />

          <FeatureItem 
            icon={IoChatbubbles} 
            title="Persistent Project Chat" 
            desc="Stay connected with built-in chat—send live messages, share emoji, and receive instant notifications. No separate chat app needed." 
            accent={COLORS.deepest}
          />

          <FeatureItem 
            icon={IoShieldCheckmark} 
            title="Secure Authentication & Roles" 
            desc="Easy signup, login, and fine-grained user roles—powered and protected by Supabase Auth." 
            accent={COLORS.blue}
          />
        </FeatureGrid>

        <Divider />
        <SubHeading>Why Synergy?</SubHeading>
        {/* 💡 AboutList is now styled for better readability and a professional look */}
        <AboutList>
          <li>No more switching between multiple apps—everything your distributed team needs is in one place.</li>
          <li>Built with modern tech for reliability and speed: React, CRDT, WebRTC, Socket.io, Postgres, Supabase, and more.</li>
          <li>Scalable, modular, and beautifully responsive—works for teams from startups to enterprises.</li>
          <li>Your data and collaboration stay real-time, secure, and always in sync.</li>
        </AboutList>

        
      </Section>
    </Wrapper>
    </>
  );
}