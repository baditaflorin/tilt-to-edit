import { useEffect, useState } from "react";

import {
  createDeviceOrientationBackend,
  createTiltSimulator,
} from "@tilt-to-edit/core";
import { TiltListNavigator } from "@tilt-to-edit/react";

const ITEMS = ["Speed", "Brightness", "Contrast", "Theme"];

export function App() {
  const [mode, setMode] = useState<"simulator" | "live">("simulator");
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [beta, setBeta] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());
  const [liveBackend] = useState(() => createDeviceOrientationBackend());
  const backend = mode === "simulator" ? simulator.backend : liveBackend;

  useEffect(() => {
    if (mode !== "simulator") {
      return;
    }

    simulator.emit({ beta, gamma: 0 });
  }, [beta, mode, simulator]);

  return (
    <main className="shell">
      <header>
        <p className="eyebrow">Example</p>
        <h1>React List Navigator</h1>
        <p>
          This example focuses on discrete vertical navigation with a separate
          confirmation step.
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
        </section>
      ) : (
        <p className="live-note">
          Open this page on a supported mobile browser, then use the built-in
          controls below to enable tilt permission and calibrate your neutral
          pose.
        </p>
      )}

      <TiltListNavigator
        backend={backend}
        items={ITEMS}
        onCommit={(index) => {
          setSelectedIndex(index);
        }}
        selectedIndex={selectedIndex}
      />
    </main>
  );
}
