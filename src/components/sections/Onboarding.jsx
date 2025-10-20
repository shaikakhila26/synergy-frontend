import React from "react";
import FeatureCard from "../feature/FeatureCard";
import COLORS from "../../styles/colors";

export default function Onboarding() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS.deepest
      }}>
        Get your new hires on board
      </h2>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
        padding: "0 1.5rem"
      }}>
        <FeatureCard icon="💡" title="Seamless Transition" desc="Collaborate with onboarding checklists." bg={COLORS.pink} fg={COLORS.deepest} />
        <FeatureCard icon="🌸" title="Settling In" desc="Step-by-step orientation for every joiner." bg={COLORS.purple} fg={COLORS.pink} />
        <FeatureCard icon="⚡" title="Up and Running" desc="Ramp-up for productivity from day one." bg={COLORS.blue} fg={COLORS.pink} />
      </div>
    </section>
  );
}
