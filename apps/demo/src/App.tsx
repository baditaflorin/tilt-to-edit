import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import {
  TiltListNavigator,
  TiltMenuSelector,
  TiltSlider,
  TiltStepper,
  useTiltToEdit,
} from "@tilt-to-edit/react";

import { TiltSceneRemixCard } from "./TiltSceneRemixCard";

const MENU_ITEMS = ["Brightness", "Contrast", "Theme", "Focus mode", "Volume"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function LiveSliderMonitor({
  backend,
  value,
  min = 0,
  max = 100,
  sensitivity,
}: {
  backend: TiltSensorBackend;
  value: number;
  min?: number;
  max?: number;
  sensitivity?: number;
}) {
  const { state, requestPermission, calibrate } = useTiltToEdit({
    backend,
    axisMode: "horizontal",
    smoothing: 0.75,
  });
  const effectiveSensitivity = sensitivity ?? Math.max(max - min, 1);
  const previewValue = clamp(
    value + state.intentVector.x * effectiveSensitivity,
    min,
    max,
  );

  return (
    <div className="aurora-card live-slider-monitor">
      <div className="section-head">
        <div>
          <p className="micro-label">Always visible</p>
          <h2>Live Slider Monitor</h2>
          <p>
            Keep this near the top of the page while testing live tilt on your
            phone.
          </p>
        </div>
        <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
      </div>
      <div className="metric-strip">
        <div>
          <span>Intent X</span>
          <strong>{state.intentVector.x.toFixed(2)}</strong>
        </div>
        <div>
          <span>Preview</span>
          <strong>{previewValue.toFixed(2)}</strong>
        </div>
        <div>
          <span>Committed</span>
          <strong>{value.toFixed(2)}</strong>
        </div>
      </div>
      <input
        aria-label="Live slider monitor preview"
        max={max}
        min={min}
        readOnly
        type="range"
        value={previewValue}
      />
      <div className="action-row">
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
      </div>
    </div>
  );
}

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const [stepperValue, setStepperValue] = useState(6);
  const [sliderValue, setSliderValue] = useState(42);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [menuSelection, setMenuSelection] = useState(2);
  const resolvedBackend = backend ?? liveBackend;
  const { state, requestPermission, calibrate, pause, resume } = useTiltToEdit({
    backend: resolvedBackend,
    axisMode: "both",
    smoothing: 0.25,
  });

  return (
    <main className="page">
      <div className="backdrop backdrop-one" aria-hidden="true" />
      <div className="backdrop backdrop-two" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Tilt To Edit v0.3.2</p>
          <h1>Live-device editing that feels more like steering than tapping</h1>
          <p className="hero-text">
            This integrated demo is now live-device-first. Use the motion
            permission ritual once, calibrate a neutral pose, then explore
            discrete edits, continuous edits, list browsing, a hybrid menu, and
            a scene remix panel where tilt swaps characters and backdrops.
          </p>
          <div className="hero-actions">
            <a className="back-link" href="../">
              View all demos
            </a>
            <a className="back-link" href="../space/">
              Open 3D vector space
            </a>
            <a
              className="back-link"
              href="https://github.com/baditaflorin/tilt-to-edit"
              rel="noreferrer"
              target="_blank"
            >
              Fork on GitHub
            </a>
            <span className={`status-badge status-${state.status}`}>
              {state.status}
            </span>
          </div>
        </div>

        <div className="hero-panel aurora-card">
          <p className="micro-label">Mobile ritual</p>
          <ol>
            <li>Tap <strong>Enable tilt</strong>.</li>
            <li>Allow <strong>Motion &amp; Orientation Access</strong>.</li>
            <li>Hold the phone naturally and tap <strong>Calibrate</strong>.</li>
            <li>Browse with vertical tilt. Commit with buttons or right-tilt selection.</li>
          </ol>
          <div className="action-row">
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
            {state.status === "active" ? (
              <button
                onClick={() => {
                  pause();
                }}
                type="button"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => {
                  void resume();
                }}
                type="button"
              >
                Resume
              </button>
            )}
          </div>
          <p className="hero-credit">
            Created by{" "}
            <a
              className="back-link"
              href="https://www.linkedin.com/in/baditaflorin/"
              rel="noreferrer"
              target="_blank"
            >
              Florin Badita
            </a>
            . Fork the source to adapt it for your own site.
          </p>
        </div>
      </header>

      <section className="console-grid">
        <div className="aurora-card">
          <div className="section-head">
            <div>
              <p className="micro-label">Sensor console</p>
              <h2>Intent telemetry</h2>
              <p>
                These values come from the same live backend used by every
                control below.
              </p>
            </div>
          </div>
          <div className="metric-strip">
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

        <LiveSliderMonitor backend={resolvedBackend} value={sliderValue} />
      </section>

      <section className="showcase-grid">
        <TiltSceneRemixCard backend={resolvedBackend} />
        <TiltStepper
          backend={resolvedBackend}
          onCommit={(nextValue) => {
            setStepperValue(nextValue);
          }}
          value={stepperValue}
        />
        <TiltSlider
          backend={resolvedBackend}
          onCommit={(nextValue) => {
            setSliderValue(nextValue);
          }}
          value={sliderValue}
        />
        <TiltListNavigator
          backend={resolvedBackend}
          items={MENU_ITEMS}
          onCommit={(index) => {
            setSelectedIndex(index);
          }}
          selectedIndex={selectedIndex}
        />
        <TiltMenuSelector
          backend={resolvedBackend}
          items={MENU_ITEMS}
          onCommit={(index) => {
            setMenuSelection(index);
          }}
          selectedIndex={menuSelection}
        />
      </section>
    </main>
  );
}
