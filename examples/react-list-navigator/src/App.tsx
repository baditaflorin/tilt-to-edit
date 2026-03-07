import { useEffect, useState } from "react";

import { createTiltSimulator } from "@tilt-to-edit/core";
import { TiltListNavigator } from "@tilt-to-edit/react";

const ITEMS = ["Alpha", "Beta", "Gamma", "Delta"];

export function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [beta, setBeta] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());

  useEffect(() => {
    simulator.emit({ beta, gamma: 0 });
  }, [beta, simulator]);

  return (
    <main className="shell">
      <header>
        <p className="eyebrow">Example</p>
        <h1>React List Navigator</h1>
        <p>
          This example focuses on discrete vertical navigation with a separate
          confirmation step.
        </p>
      </header>

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

      <TiltListNavigator
        backend={simulator.backend}
        items={ITEMS}
        onCommit={(index) => {
          setSelectedIndex(index);
        }}
        selectedIndex={selectedIndex}
      />
    </main>
  );
}

