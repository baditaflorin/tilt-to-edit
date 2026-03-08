import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import { Controls, Diagnostics, Metrics, MetricsGroup, Panel, formatStatus } from "./ui";
import { useTiltToEdit } from "./useTiltToEdit";

export interface TiltMenuSelectorProps {
  label?: string;
  items: string[];
  selectedIndex?: number;
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  onCommit?: (index: number, item: string) => void;
}

export function TiltMenuSelector({
  label = "Tilt Menu Selector",
  items,
  selectedIndex = 0,
  backend,
  requireArm = false,
  onCommit,
}: TiltMenuSelectorProps) {
  const { state, requestPermission, calibrate, confirm, pause, resume, setArmed } =
    useTiltToEdit({
      backend,
      axisMode: "both",
      smoothing: 0.72,
      stepThreshold: 8,
      requireArmedForStep: requireArm,
    });
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);
  const [lastAction, setLastAction] = useState<"idle" | "committed" | "reverted">(
    "idle",
  );
  const lastVerticalSequenceRef = useRef(state.stepEvents.y.sequence);
  const lastHorizontalSequenceRef = useRef(state.stepEvents.x.sequence);

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (state.stepEvents.y.sequence === lastVerticalSequenceRef.current) {
      return;
    }

    lastVerticalSequenceRef.current = state.stepEvents.y.sequence;
    if (state.stepEvents.y.direction === 0) {
      return;
    }

    setLastAction("idle");
    setHighlightedIndex((currentIndex) => {
      const nextIndex = currentIndex + state.stepEvents.y.direction;
      return Math.min(Math.max(nextIndex, 0), items.length - 1);
    });
  }, [items.length, state.stepEvents.y.direction, state.stepEvents.y.sequence]);

  useEffect(() => {
    if (state.stepEvents.x.sequence === lastHorizontalSequenceRef.current) {
      return;
    }

    lastHorizontalSequenceRef.current = state.stepEvents.x.sequence;
    if (state.stepEvents.x.direction === 0) {
      return;
    }

    const horizontalDominant =
      Math.abs(state.intentVector.x) > Math.abs(state.intentVector.y) + 0.08;
    if (!horizontalDominant) {
      return;
    }

    if (state.stepEvents.x.direction > 0) {
      confirm();
      setLastAction("committed");
      onCommit?.(highlightedIndex, items[highlightedIndex] ?? "");
      return;
    }

    setLastAction("reverted");
    setHighlightedIndex(selectedIndex);
  }, [
    confirm,
    highlightedIndex,
    items,
    onCommit,
    selectedIndex,
    state.intentVector.x,
    state.intentVector.y,
    state.stepEvents.x.direction,
    state.stepEvents.x.sequence,
  ]);

  return (
    <Panel
      title={label}
      eyebrow="Hybrid Control"
      description="Tilt up and down to browse. Lean right to commit. Lean left to return to the current choice."
    >
      <MetricsGroup>
        <Metrics label="Status" value={formatStatus(state)} />
        <Metrics label="Selected" value={items[selectedIndex] ?? "n/a"} />
        <Metrics label="Highlighted" value={items[highlightedIndex] ?? "n/a"} />
        <Metrics
          label="Action"
          value={
            lastAction === "idle"
              ? "browse"
              : lastAction === "committed"
                ? "committed"
                : "returned"
          }
        />
        <Metrics
          label="Intent"
          value={`${state.intentVector.x.toFixed(2)} / ${state.intentVector.y.toFixed(2)}`}
        />
      </MetricsGroup>
      <ol
        style={{
          marginTop: "0",
          paddingLeft: "0",
          listStyle: "none",
          display: "grid",
          gap: "10px",
        }}
      >
        {items.map((item, index) => {
          const isHighlighted = index === highlightedIndex;
          const isSelected = index === selectedIndex;

          return (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "18px",
                border: isHighlighted
                  ? "1px solid rgba(255, 191, 36, 0.65)"
                  : "1px solid rgba(255, 255, 255, 0.12)",
                background: isHighlighted
                  ? "linear-gradient(135deg, rgba(255, 218, 121, 0.24), rgba(255, 255, 255, 0.12))"
                  : "rgba(255, 255, 255, 0.05)",
                color: isSelected ? "#fff7ed" : "rgba(248, 250, 252, 0.92)",
                boxShadow: isHighlighted
                  ? "0 18px 34px rgba(245, 158, 11, 0.14)"
                  : "none",
              }}
            >
              <span style={{ fontWeight: isHighlighted ? 700 : 500 }}>{item}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isSelected ? "#fbbf24" : "rgba(255, 255, 255, 0.48)",
                }}
              >
                {isSelected ? "Live" : isHighlighted ? "Focus" : ""}
              </span>
            </li>
          );
        })}
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
      <Diagnostics snapshot={state} />
    </Panel>
  );
}
