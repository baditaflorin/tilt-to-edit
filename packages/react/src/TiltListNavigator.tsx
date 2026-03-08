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
    <Panel
      title={label}
      eyebrow="Vertical browse"
      description="Move through the list with stable tilt zones, then confirm separately when the highlight lands where you want."
    >
      <Metrics label="Status" value={formatStatus(state)} />
      <Metrics label="Selected" value={items[selectedIndex] ?? "n/a"} />
      <Metrics label="Highlighted" value={items[highlightedIndex] ?? "n/a"} />
      <Metrics label="Intent Y" value={state.intentVector.y.toFixed(2)} />
      <ol
        style={{
          marginTop: "16px",
          paddingLeft: "0",
          listStyle: "none",
          display: "grid",
          gap: "10px",
        }}
      >
        {items.map((item, index) => (
          <li
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "18px",
              border:
                index === highlightedIndex
                  ? "1px solid rgba(255, 191, 36, 0.65)"
                  : "1px solid rgba(255, 255, 255, 0.12)",
              background:
                index === highlightedIndex
                  ? "linear-gradient(135deg, rgba(255, 218, 121, 0.24), rgba(255, 255, 255, 0.12))"
                  : "rgba(255, 255, 255, 0.05)",
              color: index === selectedIndex ? "#fff7ed" : "rgba(248, 250, 252, 0.92)",
              boxShadow:
                index === highlightedIndex
                  ? "0 18px 34px rgba(245, 158, 11, 0.14)"
                  : "none",
            }}
          >
            <span style={{ fontWeight: index === highlightedIndex ? 700 : 500 }}>
              {item}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:
                  index === selectedIndex
                    ? "#fbbf24"
                    : "rgba(255, 255, 255, 0.48)",
              }}
            >
              {index === selectedIndex ? "Live" : index === highlightedIndex ? "Focus" : ""}
            </span>
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
        showArmToggle={requireArm}
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
