import { useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import {
  TiltMenuSelector,
  TiltSettingsAdjuster,
  TiltSubmenuEditor,
  type TiltSettingItem,
  type TiltSettingSection,
} from "@tilt-to-edit/react";

const ITEMS = ["Brightness", "Contrast", "Theme", "Ambient audio", "Focus mode"];

const DIRECT_ADJUST_ITEMS: TiltSettingItem[] = [
  {
    label: "Brightness",
    value: 64,
    min: 0,
    max: 100,
    step: 4,
    unit: "%",
    description: "Screen luminance for the whole scene.",
  },
  {
    label: "Contrast",
    value: 48,
    min: 0,
    max: 100,
    step: 3,
    unit: "%",
    description: "Boost or soften the difference between lights and shadows.",
  },
  {
    label: "Volume",
    value: 32,
    min: 0,
    max: 100,
    step: 4,
    unit: "%",
    description: "Overall mix level for the active room.",
  },
  {
    label: "Warmth",
    value: 5600,
    min: 3200,
    max: 7200,
    step: 200,
    unit: "K",
    description: "Color temperature for the environment lighting.",
  },
];

const SUBMENU_SECTIONS: TiltSettingSection[] = [
  {
    label: "Display",
    description: "Primary visual output controls.",
    items: [
      { label: "Brightness", value: 72, min: 0, max: 100, step: 4, unit: "%" },
      { label: "Contrast", value: 46, min: 0, max: 100, step: 3, unit: "%" },
      { label: "Saturation", value: 58, min: 0, max: 100, step: 3, unit: "%" },
    ],
  },
  {
    label: "Audio",
    description: "Playback and atmosphere.",
    items: [
      { label: "Volume", value: 34, min: 0, max: 100, step: 4, unit: "%" },
      { label: "Bass", value: 5, min: -10, max: 10, step: 1 },
      { label: "Presence", value: 12, min: 0, max: 20, step: 1 },
    ],
  },
  {
    label: "Scene",
    description: "Environmental motion and depth cues.",
    items: [
      { label: "Parallax", value: 18, min: 0, max: 30, step: 1 },
      { label: "Fog", value: 24, min: 0, max: 40, step: 2, unit: "%" },
      { label: "Glow", value: 41, min: 0, max: 100, step: 4, unit: "%" },
    ],
  },
];

export interface AppProps {
  backend?: TiltSensorBackend;
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [adjustItems, setAdjustItems] = useState(DIRECT_ADJUST_ITEMS);
  const [submenuSections, setSubmenuSections] = useState(SUBMENU_SECTIONS);
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;

  return (
    <main className="shell">
      <div className="halo halo-a" aria-hidden="true" />
      <div className="halo halo-b" aria-hidden="true" />

      <header>
        <p className="eyebrow">Menu Patterns</p>
        <h1>React Menu Selector</h1>
        <p>
          This page compares three interaction styles: browse and commit,
          browse and adjust in place, and a three-part submenu that changes
          what vertical tilt does depending on the active lane.
        </p>
        <a className="back-link" href="../">
          View all demos
        </a>
      </header>

      <section className="hero-card">
        <div>
          <p className="micro-label">Gesture recipe</p>
          <h2>One engine, three editing grammars</h2>
          <p>
            On iPhone or iPad in Safari or Chrome, tap <strong>Enable tilt</strong>,
            allow <strong>Motion &amp; Orientation Access</strong>, then tap{" "}
            <strong>Calibrate</strong>. Start with the lightest pattern if you
            just need selection, move to direct adjust when values should
            change immediately, and use the three-lane submenu when you need
            explicit drill-in behavior.
          </p>
        </div>
      </section>

      <section className="comparison-grid">
        <div className="comparison-copy">
          <p className="micro-label">Pattern one</p>
          <h2>Browse and commit</h2>
          <p>
            Tilt up or down to move focus, lean right to commit, and lean left
            to snap back to the last committed item.
          </p>
        </div>
        <TiltMenuSelector
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
          <h2>Browse and adjust in place</h2>
          <p>
            Vertical tilt changes which row is live. Horizontal tilt changes the
            focused setting immediately, which makes brightness, contrast, and
            volume feel more like direct steering.
          </p>
        </div>
        <TiltSettingsAdjuster
          backend={resolvedBackend}
          items={adjustItems}
          onChange={(event) => {
            setAdjustItems(event.items);
          }}
        />
      </section>

      <section className="comparison-grid">
        <div className="comparison-copy">
          <p className="micro-label">Pattern three</p>
          <h2>Three-part submenu editor</h2>
          <p>
            Right tilt moves from sections to items to the editor. Left tilt
            backs out. Once the editor lane is active, vertical tilt stops
            browsing and starts increasing or decreasing the focused value.
          </p>
        </div>
        <TiltSubmenuEditor
          backend={resolvedBackend}
          onChange={(event) => {
            setSubmenuSections(event.sections);
          }}
          sections={submenuSections}
        />
      </section>
    </main>
  );
}
