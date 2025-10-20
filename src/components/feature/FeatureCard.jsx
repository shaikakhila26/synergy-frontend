import React from "react";
import styled from "styled-components";

// You can import/shared your palette object if you want to make this file generic

const CardContainer = styled.div`
  background: ${({ $bg }) => $bg || "#fff"};
  color: ${({ $fg }) => $fg || "#210635"};
  border-radius: 1.3rem;
  box-shadow: 0 4px 20px #420d4b22;
  padding: 2rem 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform 0.18s, box-shadow 0.18s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px #7b337e33;
  }
`;

const CardIcon = styled.span`
  font-size: 1.8rem;
  margin-bottom: 0.6rem;
`;

const CardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
`;

const CardDesc = styled.p`
  font-size: 1rem;
  color: ${({ fg }) => fg || "#7b337e"};
  margin-top: 0.15rem;
`;

export default function FeatureCard({ icon, title, desc, bg, fg }) {
  return (
    <CardContainer $bg={bg} $fg={fg}>
      <CardIcon>{icon}</CardIcon>
      <CardTitle>{title}</CardTitle>
      <CardDesc $fg={fg}>{desc}</CardDesc>
    </CardContainer>
  );
}
