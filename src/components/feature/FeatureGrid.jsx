import React from "react";
import FeatureCard from "./FeatureCard";

// Palette for usage
const COLORS = [
  "#F5D5E0", // Soft pink
  "#6667AB", // Indigo blue
  "#7B337E", // Main purple
  "#420D4B", // Dark purple
  "#210635"  // Deepest
];

const featureData = [
  { icon: "💬", title: "Help your team get to know each other", desc: "Rich profiles and dynamic org charts bring everyone closer.", bg: COLORS[0], fg: COLORS[4] },
  { icon: "🎉", title: "Create and attend company events", desc: "Plan, RSVP, and keep memories together.", bg: COLORS[1], fg: COLORS[0] },
  { icon: "📸", title: "Gather work-related photos", desc: "A private feed of your team’s best moments.", bg: COLORS[2], fg: COLORS[0] },
  { icon: "⭐", title: "Empower your employees", desc: "Give everyone a voice with surveys and feedback.", bg: COLORS[3], fg: COLORS[0] },
];

const Grid = ({ children }) => (
  <div style={{
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
    padding: "0 1.5rem"
  }}>
    {children}
  </div>
);

export default function FeatureGrid() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS[4]
      }}>A dedicated space for your employees</h2>
      <Grid>
        {featureData.map((d, i) => (
          <FeatureCard key={i} {...d} />
        ))}
      </Grid>
    </section>
  );
}
