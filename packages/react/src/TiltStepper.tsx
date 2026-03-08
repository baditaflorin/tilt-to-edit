import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import { useTiltToEdit } from "./useTiltToEdit";
import { clamp, Controls, Diagnostics, Metrics, Panel, formatStatus } from "./ui";

export interface TiltStepperProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  stepThreshold?: number;
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  onCommit?: (value: number) => void;
}

export function TiltStepper({
  label = "Tilt Stepper",
  value,
  min = 0,
  max = 100,
  step = 1,
  stepThreshold = 6,
  backend,
  requireArm = false,
  onCommit,
}: TiltStepperProps) {
  const { state, requestPermission, calibrate, confirm, pause, resume, setArmed } =
    useTiltToEdit({
      backend,
      axisMode: "horizontal",
      smoothing: 0.75,
      stepThreshold,
      requireArmedForStep: requireArm,
    });
  const [draftValue, setDraftValue] = useState(value);
  const lastSequenceRef = useRef(state.stepEvents.x.sequence);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    if (state.stepEvents.x.sequence === lastSequenceRef.current) {
      return;
    }

    lastSequenceRef.current = state.stepEvents.x.sequence;
    if (state.stepEvents.x.direction === 0) {
      return;
    }

    setDraftValue((currentValue) =>
      clamp(currentValue + state.stepEvents.x.direction * step, min, max),
    );
  }, [
    max,
    min,
    state.stepEvents.x.direction,
    state.stepEvents.x.sequence,
    step,
  ]);

  return (
    <Panel title={label}>
      <Metrics label="Status" value={formatStatus(state)} />
      <Metrics label="Committed" value={value} />
      <Metrics label="Draft" value={draftValue} />
      <Metrics label="Intent X" value={state.intentVector.x.toFixed(2)} />
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
            setDraftValue(value);
          }}
          type="button"
        >
          Reset draft
        </button>
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
