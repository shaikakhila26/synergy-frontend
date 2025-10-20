import React from "react";
import COLORS from "../../styles/colors";

const Card = ({ title, children }) => (
  <div style={{
    borderRadius: "1.3rem",
    background: COLORS.pink,
    boxShadow: "0 2px 12px #420d4b22",
    padding: "1.8rem 1.2rem",
    margin: "1rem 0"
  }}>
    <h3 style={{
      fontSize: "1.15rem",
      fontWeight: 700,
      marginBottom: 10,
      color: COLORS.deepest // <-- Ensures visibility!
    }}>
      {title}
    </h3>
    <div style={{ color: COLORS.purple }}>{children}</div>
  </div>
);


export default function WhatsNew() {
  return (
    <section>
      <h2 style={{
        textAlign: "center",
        fontSize: "1.6rem",
        marginBottom: "2.5rem",
        fontWeight: 800,
        color: COLORS.deepest
      }}>
        What’s new
      </h2>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
        padding: "0 1.5rem"
      }}>
        <Card title="Improved profile analytics">
          <ul>
            <li>Role-based insights to reduce guesswork.</li>
            <li>Export CSV from any report view.</li>
          </ul>
        </Card>
        <Card title=" Teams integration" >
          <ul>
            <li>Announce events and birthdays in your channels.</li>
            <li>Approve time off from Teams.</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}