import { useEffect, useState } from "react";

import {
  createDeviceOrientationBackend,
  createTiltSimulator,
} from "@tilt-to-edit/core";
import {
  TiltListNavigator,
  TiltSlider,
  TiltStepper,
  useTiltToEdit,
} from "@tilt-to-edit/react";

const LIST_ITEMS = ["Speed", "Brightness", "Contrast", "Theme"];

export function App() {
  const [mode, setMode] = useState<"simulator" | "live">("simulator");
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());
  const [liveBackend] = useState(() => createDeviceOrientationBackend());
  const [stepperValue, setStepperValue] = useState(6);
  const [sliderValue, setSliderValue] = useState(42);
  const [selectedIndex, setSelectedIndex] = useState(1);
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
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Tilt To Edit v0.2.5</p>
          <h1>Device tilt as intentional editing input</h1>
          <p>
            The demo runs on GitHub Pages and supports both live mobile sensors
            and a desktop simulator. It exercises the core engine, React hook,
            and first-party UI primitives together.
          </p>
          <a className="back-link" href="../">
            View all demos
          </a>
        </div>
        <div className="mode-switch">
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
      </header>

      <section className="console">
        <div className="card">
          <h2>Sensor Console</h2>
          <div className="metrics">
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
          <div className="actions">
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
        </div>

        <div className="card">
          <h2>Input Mode</h2>
          <p>
            The same backend instance is shared across the example controls
            below, which makes the demo representative of a real app shell.
          </p>
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
          ) : (
            <p className="live-note">
              On a supported mobile browser, use the buttons above to request
              permission and calibrate your neutral pose.
            </p>
          )}
        </div>
      </section>

      <section className="grid">
        <TiltStepper
          backend={backend}
          onCommit={(nextValue) => {
            setStepperValue(nextValue);
          }}
          value={stepperValue}
        />
        <TiltSlider
          backend={backend}
          onCommit={(nextValue) => {
            setSliderValue(nextValue);
          }}
          value={sliderValue}
        />
        <TiltListNavigator
          backend={backend}
          items={LIST_ITEMS}
          onCommit={(index) => {
            setSelectedIndex(index);
          }}
          selectedIndex={selectedIndex}
        />
      </section>
    </main>
  );
}
