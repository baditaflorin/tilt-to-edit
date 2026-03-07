import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import { useTiltToEdit } from "./useTiltToEdit";
import { Controls, Diagnostics, Metrics, Panel, formatStatus } from "./ui";

export interface TiltListNavigatorProps {
  label?: string;
  items: string[];
  selectedIndex?: number;
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  onCommit?: (index: number, item: string) => void;
}

export function TiltListNavigator({
  label = "Tilt List Navigator",
  items,
  selectedIndex = 0,
  backend,
  requireArm = false,
  onCommit,
}: TiltListNavigatorProps) {
  const { state, requestPermission, calibrate, confirm, pause, resume, setArmed } =
    useTiltToEdit({
      backend,
      axisMode: "vertical",
      smoothing: 0.75,
      stepThreshold: 10,
      requireArmedForStep: requireArm,
    });
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);
  const lastSequenceRef = useRef(state.stepEvents.y.sequence);

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (state.stepEvents.y.sequence === lastSequenceRef.current) {
      return;
    }

    lastSequenceRef.current = state.stepEvents.y.sequence;
    if (state.stepEvents.y.direction === 0) {
      return;
    }

    setHighlightedIndex((currentIndex) => {
      const nextIndex = currentIndex + state.stepEvents.y.direction;
      return Math.min(Math.max(nextIndex, 0), items.length - 1);
    });
  }, [items.length, state.stepEvents.y.direction, state.stepEvents.y.sequence]);

  return (
    <Panel title={label}>
      <Metrics label="Status" value={formatStatus(state)} />
      <Metrics label="Selected" value={items[selectedIndex] ?? "n/a"} />
      <Metrics label="Highlighted" value={items[highlightedIndex] ?? "n/a"} />
      <Metrics label="Intent Y" value={state.intentVector.y.toFixed(2)} />
      <ol style={{ marginTop: "12px", paddingLeft: "20px" }}>
        {items.map((item, index) => (
          <li
            key={item}
            style={{
              fontWeight: index === highlightedIndex ? 700 : 400,
              color: index === selectedIndex ? "#8a1c1c" : "#1f2937",
            }}
          >
            {item}
          </li>
        ))}
      </ol>
      <Controls
        snapshot={state}
        onRequestPermission={() => {
          void requestPermission();
        }}
        onCalibrate={() => {
          calibrate();
        }}
        onToggleArm={() => {
          setArmed(!state.armed);
        }}
        onPause={() => {
          pause();
        }}
        onResume={() => {
          void resume();
        }}
      />
      <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => {
            confirm();
            onCommit?.(highlightedIndex, items[highlightedIndex] ?? "");
          }}
          type="button"
        >
          Confirm
        </button>
      </div>
      <Diagnostics snapshot={state} />
    </Panel>
  );
}
