import { useEffect, useState } from "react";

import {
  createDeviceOrientationBackend,
  createTiltSimulator,
} from "@tilt-to-edit/core";
import { TiltStepper } from "@tilt-to-edit/react";

export function App() {
  const [mode, setMode] = useState<"simulator" | "live">("simulator");
  const [value, setValue] = useState(12);
  const [gamma, setGamma] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());
  const [liveBackend] = useState(() => createDeviceOrientationBackend());
  const backend = mode === "simulator" ? simulator.backend : liveBackend;

  useEffect(() => {
    if (mode !== "simulator") {
      return;
    }

    simulator.emit({ beta: 0, gamma });
  }, [gamma, mode, simulator]);

  return (
    <main className="shell">
      <header>
        <p className="eyebrow">Example</p>
        <h1>React Stepper</h1>
        <p>
          This example focuses on discrete editing with left and right tilt plus
          explicit confirmation.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="mode-switch">
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
      </section>

      {mode === "simulator" ? (
        <section className="simulator">
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
        </section>
      ) : (
        <p className="live-note">
          Open this page on a supported mobile browser, then use the built-in
          controls below to enable tilt permission and calibrate your neutral
          pose.
        </p>
      )}

      <TiltStepper
        backend={backend}
        onCommit={(nextValue) => {
          setValue(nextValue);
        }}
        value={value}
      />
    </main>
  );
}
