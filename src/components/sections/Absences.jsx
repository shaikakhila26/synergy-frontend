import React from "react";
import FeatureCard from "../feature/FeatureCard";
import COLORS from "../../styles/colors";

export default function Absences() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS.deepest
      }}>
        Manage absences with ease
      </h2>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
        padding: "0 1.5rem"
      }}>
        <FeatureCard icon="🗓️" title="Absence Tracking" desc="Flexible, easy-to-use tracking for all your needs." bg={COLORS.pink} fg={COLORS.deepest} />
        <FeatureCard icon="😃" title="Holiday Scheduler" desc="Plan holidays and avoid resource conflicts." bg={COLORS.blue} fg={COLORS.pink} />
      </div>
    </section>
  );
}
