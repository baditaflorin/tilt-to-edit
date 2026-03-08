import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { TiltMenuSelector } from "@tilt-to-edit/react";

const ITEMS = ["Brightness", "Contrast", "Theme", "Ambient audio", "Focus mode"];

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;

  return (
    <main className="shell">
      <div className="halo halo-a" aria-hidden="true" />
      <div className="halo halo-b" aria-hidden="true" />

      <header>
        <p className="eyebrow">Hybrid Control</p>
        <h1>React Menu Selector</h1>
        <p>
          This example combines browsing and selection in one gesture language:
          tilt up or down to move focus, tilt right to select, and tilt left to
          return to the last committed item.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="hero-card">
        <div>
          <p className="micro-label">Gesture recipe</p>
          <h2>Right means keep it, left means back out</h2>
          <p>
            On iPhone or iPad in Safari or Chrome, tap <strong>Enable tilt</strong>,
            allow <strong>Motion &amp; Orientation Access</strong>, then tap{" "}
            <strong>Calibrate</strong>. Browse vertically, then make a short
            right lean to commit the focused item.
          </p>
        </div>
      </section>

      <TiltMenuSelector
        backend={resolvedBackend}
        items={ITEMS}
        onCommit={(index) => {
          setSelectedIndex(index);
        }}
        selectedIndex={selectedIndex}
      />
    </main>
  );
}
