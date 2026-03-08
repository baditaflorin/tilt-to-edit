import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { TiltListNavigator } from "@tilt-to-edit/react";

const ITEMS = ["Speed", "Brightness", "Contrast", "Theme"];

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;

  return (
    <main className="shell">
      <div className="halo halo-a" aria-hidden="true" />
      <div className="halo halo-b" aria-hidden="true" />

      <header>
        <p className="eyebrow">Browse Control</p>
        <h1>React List Navigator</h1>
        <p>
          This example focuses on vertical browsing with a separate commit step,
          which keeps list movement stable even when you are holding the phone
          one-handed.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="hero-card">
        <div>
          <p className="micro-label">Gesture recipe</p>
          <h2>Browse first, confirm second</h2>
          <p>
            On iPhone or iPad in Safari or Chrome, tap <strong>Enable tilt</strong>,
            allow <strong>Motion &amp; Orientation Access</strong>, then tap{" "}
            <strong>Calibrate</strong>. Tilt up or down to move the highlight
            through the list.
          </p>
        </div>
      </section>

      <TiltListNavigator
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
