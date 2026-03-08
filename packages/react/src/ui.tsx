import type { ReactNode } from "react";

import type { TiltEngineSnapshot } from "@tilt-to-edit/core";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatStatus(snapshot: TiltEngineSnapshot) {
  return snapshot.status.replace(/-/g, " ");
}

export function Panel({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "28px",
        padding: "20px",
        background:
          "linear-gradient(160deg, rgba(10, 26, 46, 0.92), rgba(23, 37, 84, 0.78))",
        boxShadow: "0 30px 60px rgba(15, 23, 42, 0.28)",
        color: "#f8fafc",
        backdropFilter: "blur(18px)",
      }}
    >
      {eyebrow ? (
        <p
          style={{
            marginTop: 0,
            marginBottom: "10px",
            color: "#fbbf24",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: "0.72rem",
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h3
        style={{
          marginTop: 0,
          marginBottom: description ? "8px" : "14px",
          fontSize: "1.35rem",
        }}
      >
        {title}
      </h3>
      {description ? (
        <p
          style={{
            marginTop: 0,
            marginBottom: "16px",
            color: "rgba(226, 232, 240, 0.78)",
            maxWidth: "52ch",
          }}
        >
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function Metrics({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        fontFamily: "monospace",
        alignItems: "center",
        padding: "11px 12px",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        marginBottom: "10px",
      }}
    >
      <span style={{ color: "rgba(226, 232, 240, 0.72)" }}>{label}</span>
      <strong style={{ color: "#fff7ed" }}>{value}</strong>
    </div>
  );
}

export function Diagnostics({ snapshot }: { snapshot: TiltEngineSnapshot }) {
  if (snapshot.diagnostics.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        margin: "16px 0 0",
        paddingLeft: "18px",
        color: "#fed7aa",
        background: "rgba(159, 18, 57, 0.18)",
        border: "1px solid rgba(251, 146, 60, 0.18)",
        borderRadius: "18px",
        paddingTop: "12px",
        paddingBottom: "12px",
        paddingRight: "12px",
      }}
    >
      {snapshot.diagnostics.map((diagnostic) => (
        <li key={`${diagnostic.code}-${diagnostic.message}`}>
          {diagnostic.message}
          {diagnostic.detail ? ` (${diagnostic.detail})` : ""}
        </li>
      ))}
    </ul>
  );
}

export function Controls({
  snapshot,
  onRequestPermission,
  onCalibrate,
  onToggleArm,
  onPause,
  onResume,
  showArmToggle = true,
}: {
  snapshot: TiltEngineSnapshot;
  onRequestPermission: () => void;
  onCalibrate: () => void;
  onToggleArm: () => void;
  onPause: () => void;
  onResume: () => void;
  showArmToggle?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "16px",
      }}
    >
      {snapshot.status === "needs-permission" ? (
        <button onClick={onRequestPermission} type="button">
          Enable tilt
        </button>
      ) : null}
      <button onClick={onCalibrate} type="button">
        Calibrate
      </button>
      {showArmToggle ? (
        <button onClick={onToggleArm} type="button">
          {snapshot.armed ? "Disarm" : "Arm"}
        </button>
      ) : null}
      {snapshot.status === "active" ? (
        <button onClick={onPause} type="button">
          Pause
        </button>
      ) : (
        <button onClick={onResume} type="button">
          Resume
        </button>
      )}
    </div>
  );
}
