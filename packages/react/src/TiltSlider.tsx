import { useEffect, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import { useTiltToEdit } from "./useTiltToEdit";
import { clamp, Controls, Diagnostics, Metrics, Panel, formatStatus } from "./ui";

export interface TiltSliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  sensitivity?: number;
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  onCommit?: (value: number) => void;
}

export function TiltSlider({
  label = "Tilt Slider",
  value,
  min = 0,
  max = 100,
  sensitivity = 20,
  backend,
  requireArm = true,
  onCommit,
}: TiltSliderProps) {
  const { state, requestPermission, calibrate, confirm, pause, resume, setArmed } =
    useTiltToEdit({
      backend,
      axisMode: "horizontal",
      smoothing: 0.75,
    });
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    const armGate = requireArm && !state.armed;
    if (armGate) {
      setDraftValue(value);
      return;
    }

    setDraftValue(
      clamp(value + state.intentVector.x * sensitivity, min, max),
    );
  }, [max, min, requireArm, sensitivity, state.armed, state.intentVector.x, value]);

  return (
    <Panel title={label}>
      <Metrics label="Status" value={formatStatus(state)} />
      <Metrics label="Committed" value={value.toFixed(2)} />
      <Metrics label="Draft" value={draftValue.toFixed(2)} />
      <Metrics label="Intent X" value={state.intentVector.x.toFixed(2)} />
      <input
        aria-label={`${label} preview`}
        max={max}
        min={min}
        readOnly
        type="range"
        value={draftValue}
      />
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
            onCommit?.(draftValue);
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
