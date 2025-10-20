import React from "react";
import FeatureCard from "../feature/FeatureCard";
import COLORS from "../../styles/colors";

export default function HREssentials() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS.deepest
      }}>
        HR essentials, made simple
      </h2>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
        padding: "0 1.5rem"
      }}>
        <FeatureCard icon="🧑‍💼" title="Employee Profiles" desc="Centralized profiles for every employee." bg={COLORS.purple} fg={COLORS.pink} />
        <FeatureCard icon="🛡️" title="Safe Reporting" desc="Confidential and secure feedback tools." bg={COLORS.pink} fg={COLORS.deepest} />
        <FeatureCard icon="📊" title="Performance Insights" desc="Track employee growth and engagement." bg={COLORS.blue} fg={COLORS.pink} />
        <FeatureCard icon="📁" title="People Data Hub" desc="All analytics, always up to date." bg={COLORS.darkPurple} fg={COLORS.pink} />
      </div>
    </section>
  );
}
