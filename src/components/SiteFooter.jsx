import React from "react";
import styled from "styled-components";
const Footer = styled.footer`
  background: #210635;
  color: #F5D5E0;
  text-align: center;
  font-size: 1.04rem;
  padding: 2.2rem 0 1.2rem 0;
  margin-top: 4rem;
`;

export default function SiteFooter() {
  return (
    <Footer>
      &copy; {new Date().getFullYear()} Synergy — All rights reserved.
    </Footer>
  );
}
