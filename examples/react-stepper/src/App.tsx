import { useEffect, useState } from "react";

import { createTiltSimulator } from "@tilt-to-edit/core";
import { TiltStepper } from "@tilt-to-edit/react";

export function App() {
  const [value, setValue] = useState(12);
  const [gamma, setGamma] = useState(0);
  const [simulator] = useState(() => createTiltSimulator());

  useEffect(() => {
    simulator.emit({ beta: 0, gamma });
  }, [gamma, simulator]);

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

      <TiltStepper
        backend={simulator.backend}
        onCommit={(nextValue) => {
          setValue(nextValue);
        }}
        value={value}
      />
    </main>
  );
}
