import React from "react";
import styled from "styled-components";
import {
  FaUsers, FaComments, FaTasks, FaFileAlt, FaVideo, FaChalkboard, FaCalendarAlt, FaBell, FaFolderOpen, FaCog
} from "react-icons/fa";

const SidebarContainer = styled.div`
  width: 90px;
  background: #210635;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  min-height: 100vh;
  box-shadow: 3px 0 20px rgba(167,58,236,0.09);
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.$active ? "#F5D5E0" : "#6667AB")};
  margin: 1.1rem 0;
  font-size: 1.9rem;
  cursor: pointer;
  transition: color 0.16s;
  &:hover, &[active] {
    color: #A73AEC;
  }
`;

const items = [
  { id: "workspaces", icon: <FaUsers />, label: "Workspaces" },
  { id: "chat", icon: <FaComments />, label: "Chat" },
  { id: "tasks", icon: <FaTasks />, label: "Tasks" },
  { id: "docs", icon: <FaFileAlt />, label: "Docs" },
  { id: "video", icon: <FaVideo />, label: "Meet" },
  { id: "whiteboard", icon: <FaChalkboard />, label: "Whiteboard" },
  { id: "calendar", icon: <FaCalendarAlt />, label: "Calendar" },
  { id: "activity", icon: <FaBell />, label: "Activity" },
  { id: "files", icon: <FaFolderOpen />, label: "Files" },
  { id: "settings", icon: <FaCog />, label: "Settings" }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <SidebarContainer>
      {items.map(item => (
        <NavItem
          key={item.id}
          $active={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
          title={item.label}
        >
          {item.icon}
        </NavItem>
      ))}
    </SidebarContainer>
  );
}
