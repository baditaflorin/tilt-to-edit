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
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #d0d7de",
        borderRadius: "16px",
        padding: "16px",
        background: "#ffffff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "12px" }}>{title}</h3>
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
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Diagnostics({ snapshot }: { snapshot: TiltEngineSnapshot }) {
  if (snapshot.diagnostics.length === 0) {
    return null;
  }

  return (
    <ul style={{ margin: "12px 0 0", paddingLeft: "18px", color: "#8a1c1c" }}>
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
