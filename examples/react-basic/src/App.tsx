import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { useTiltToEdit } from "@tilt-to-edit/react";

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;
  const { state, requestPermission, calibrate, pause, resume, confirm, setArmed } =
    useTiltToEdit({
      backend: resolvedBackend,
      axisMode: "both",
      smoothing: 0.25,
    });

  return (
    <main className="shell">
      <div className="halo halo-a" aria-hidden="true" />
      <div className="halo halo-b" aria-hidden="true" />

      <header className="hero">
        <p className="eyebrow">Hook Surface</p>
        <h1>React Basic</h1>
        <p>
          This example exposes the raw hook state directly, so you can see the
          permission flow, calibration state, live intent vectors, and
          confirmation sequence without a higher-level primitive in the way.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="card">
        <div className="card-head">
          <div>
            <p className="micro-label">Live device only</p>
            <h2>Permission and calibration console</h2>
          </div>
          <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
        </div>

        <p className="helper-copy">
          On iPhone or iPad, tap <strong>Enable tilt</strong>, allow{" "}
          <strong>Motion &amp; Orientation Access</strong>, then hold the phone
          naturally and tap <strong>Calibrate</strong>.
        </p>

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

        <div className="stats secondary">
          <div>
            <span>Permission</span>
            <strong>{state.permissionState}</strong>
          </div>
          <div>
            <span>Armed</span>
            <strong>{state.armed ? "yes" : "no"}</strong>
          </div>
          <div>
            <span>Calibrated</span>
            <strong>{state.calibrated ? "yes" : "no"}</strong>
          </div>
          <div>
            <span>Backend</span>
            <strong>{state.backend}</strong>
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
