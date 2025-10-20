import React from "react";
import FeatureCard from "../feature/FeatureCard";
import COLORS from "../../styles/colors";

export default function Documents() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS.deepest
      }}>
        Manage documents with ease
      </h2>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
        padding: "0 1.5rem"
      }}>
        <FeatureCard icon="🔗" title="Integrations" desc="Sync with OneDrive, GDrive, Dropbox & more." bg={COLORS.blue} fg={COLORS.pink} />
        <FeatureCard icon="📂" title="Secure Storage" desc="All documents in one secure place, accessible anywhere." bg={COLORS.purple} fg={COLORS.pink} />
      </div>
    </section>
  );
}
