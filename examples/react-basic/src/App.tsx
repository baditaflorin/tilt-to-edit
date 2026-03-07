import { useEffect, useState } from "react";

import {
  createDeviceOrientationBackend,
  createTiltSimulator,
} from "@tilt-to-edit/core";
import { useTiltToEdit } from "@tilt-to-edit/react";

export function App() {
  const [mode, setMode] = useState<"simulator" | "live">("simulator");
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());
  const [liveBackend] = useState(() => createDeviceOrientationBackend());
  const backend = mode === "simulator" ? simulator.backend : liveBackend;
  const { state, requestPermission, calibrate, pause, resume, confirm, setArmed } =
    useTiltToEdit({
      backend,
      axisMode: "both",
      smoothing: 0.25,
    });

  useEffect(() => {
    if (mode !== "simulator") {
      return;
    }
    simulator.emit({ beta, gamma });
  }, [beta, gamma, mode, simulator]);

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Example</p>
        <h1>React Basic</h1>
        <p>
          This example uses the raw hook surface to show permission handling,
          calibration, normalized intent, and confirmation state.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="card">
        <div className="row">
          <button
            className={mode === "simulator" ? "active" : ""}
            onClick={() => {
              setMode("simulator");
            }}
            type="button"
          >
            Simulator
          </button>
          <button
            className={mode === "live" ? "active" : ""}
            onClick={() => {
              setMode("live");
            }}
            type="button"
          >
            Live device
          </button>
        </div>

        {mode === "simulator" ? (
          <div className="simulator">
            <label>
              Beta
              <input
                max="45"
                min="-45"
                onChange={(event) => {
                  setBeta(Number(event.currentTarget.value));
                }}
                type="range"
                value={beta}
              />
              <span>{beta.toFixed(0)} deg</span>
            </label>
            <label>
              Gamma
              <input
                max="45"
                min="-45"
                onChange={(event) => {
                  setGamma(Number(event.currentTarget.value));
                }}
                type="range"
                value={gamma}
              />
              <span>{gamma.toFixed(0)} deg</span>
            </label>
          </div>
        ) : null}

        <div className="stats">
          <div>
            <span>Status</span>
            <strong>{state.status}</strong>
          </div>
          <div>
            <span>Intent X</span>
            <strong>{state.intentVector.x.toFixed(2)}</strong>
          </div>
          <div>
            <span>Intent Y</span>
            <strong>{state.intentVector.y.toFixed(2)}</strong>
          </div>
          <div>
            <span>Confirmations</span>
            <strong>{state.confirmationSequence}</strong>
          </div>
        </div>

        <div className="row">
          {state.status === "needs-permission" ? (
            <button
              onClick={() => {
                void requestPermission();
              }}
              type="button"
            >
              Enable tilt
            </button>
          ) : null}
          <button
            onClick={() => {
              calibrate();
            }}
            type="button"
          >
            Calibrate
          </button>
          <button
            onClick={() => {
              setArmed(!state.armed);
            }}
            type="button"
          >
            {state.armed ? "Disarm" : "Arm"}
          </button>
          <button
            onClick={() => {
              state.status === "active" ? pause() : void resume();
            }}
            type="button"
          >
            {state.status === "active" ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => {
              confirm();
            }}
            type="button"
          >
            Confirm
          </button>
        </div>

        {state.diagnostics.length > 0 ? (
          <ul className="diagnostics">
            {state.diagnostics.map((diagnostic) => (
              <li key={`${diagnostic.code}-${diagnostic.message}`}>
                {diagnostic.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
