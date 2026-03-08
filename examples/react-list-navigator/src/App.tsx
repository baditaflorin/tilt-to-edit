import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { TiltListNavigator, TiltMenuSelector } from "@tilt-to-edit/react";

const ITEMS = ["Speed", "Brightness", "Contrast", "Theme", "Focus mode"];

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [menuSelection, setMenuSelection] = useState(2);
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
          This page now shows both menu styles: the pure vertical navigator with
          explicit confirmation, and the hybrid browse-and-select variant that
          adds left-right commit behavior.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="hero-card intro-card">
        <div>
          <p className="micro-label">Gesture recipe</p>
          <h2>Compare browse-first and browse-plus-select</h2>
          <p>
            On iPhone or iPad in Safari or Chrome, tap <strong>Enable tilt</strong>,
            allow <strong>Motion &amp; Orientation Access</strong>, then tap{" "}
            <strong>Calibrate</strong>. Tilt up or down to move the highlight
            through the list. The first panel uses a separate confirm action,
            while the second adds right-to-commit and left-to-return.
          </p>
        </div>
      </section>

      <section className="comparison-grid">
        <div className="comparison-copy">
          <p className="micro-label">Pattern one</p>
          <h2>Vertical list navigator</h2>
          <p>
            Stable up-down browsing with a separate confirm step. This is the
            lower-risk option when accidental commits would be expensive.
          </p>
        </div>
        <TiltListNavigator
          backend={resolvedBackend}
          items={ITEMS}
          onCommit={(index) => {
            setSelectedIndex(index);
          }}
          selectedIndex={selectedIndex}
        />
      </section>

      <section className="comparison-grid">
        <div className="comparison-copy">
          <p className="micro-label">Pattern two</p>
          <h2>Hybrid menu selector</h2>
          <p>
            The same vertical browsing, but with right tilt to commit and left
            tilt to snap back. Use this when you want fewer explicit taps.
          </p>
        </div>
        <TiltMenuSelector
          backend={resolvedBackend}
          items={ITEMS}
          onCommit={(index) => {
            setMenuSelection(index);
          }}
          selectedIndex={menuSelection}
        />
      </section>
    </main>
  );
}
