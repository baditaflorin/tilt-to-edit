import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import {
  clampIndex,
  adjustSettingItem,
  formatSettingValue,
  replaceSettingItem,
  type TiltSettingChangeEvent,
  type TiltSettingItem,
} from "./settings";
import { Controls, Diagnostics, Metrics, MetricsGroup, Panel, formatStatus } from "./ui";
import { useTiltToEdit } from "./useTiltToEdit";

export interface TiltSettingsAdjusterProps {
  label?: string;
  items: TiltSettingItem[];
  focusedIndex?: number;
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  stepThreshold?: number;
  onFocusChange?: (index: number, item: TiltSettingItem) => void;
  onChange?: (event: TiltSettingChangeEvent) => void;
}

export function TiltSettingsAdjuster({
  label = "Tilt Settings Adjuster",
  items,
  focusedIndex = 0,
  backend,
  requireArm = false,
  stepThreshold = 8,
  onFocusChange,
  onChange,
}: TiltSettingsAdjusterProps) {
  const { state, requestPermission, calibrate, pause, resume, setArmed } = useTiltToEdit({
    backend,
    axisMode: "both",
    smoothing: 0.72,
    stepThreshold,
    requireArmedForStep: requireArm,
  });
  const [resolvedItems, setResolvedItems] = useState(items);
  const [currentFocus, setCurrentFocus] = useState(clampIndex(focusedIndex, items.length));
  const [lastAction, setLastAction] = useState<"idle" | "browse" | "increase" | "decrease">(
    "idle",
  );
  const lastVerticalSequenceRef = useRef(state.stepEvents.y.sequence);
  const lastHorizontalSequenceRef = useRef(state.stepEvents.x.sequence);

  useEffect(() => {
    setResolvedItems(items);
  }, [items]);

  useEffect(() => {
    setCurrentFocus(clampIndex(focusedIndex, items.length));
  }, [focusedIndex, items.length]);

  useEffect(() => {
    if (state.stepEvents.y.sequence === lastVerticalSequenceRef.current) {
      return;
    }

    lastVerticalSequenceRef.current = state.stepEvents.y.sequence;
    if (state.stepEvents.y.direction === 0 || resolvedItems.length === 0) {
      return;
    }

    setLastAction("browse");
    setCurrentFocus((previousFocus) => {
      const nextFocus = clampIndex(
        previousFocus + state.stepEvents.y.direction,
        resolvedItems.length,
      );
      onFocusChange?.(nextFocus, resolvedItems[nextFocus] ?? resolvedItems[previousFocus]!);
      return nextFocus;
    });
  }, [
    onFocusChange,
    resolvedItems,
    state.stepEvents.y.direction,
    state.stepEvents.y.sequence,
  ]);

  useEffect(() => {
    if (state.stepEvents.x.sequence === lastHorizontalSequenceRef.current) {
      return;
    }

    lastHorizontalSequenceRef.current = state.stepEvents.x.sequence;
    if (state.stepEvents.x.direction === 0 || resolvedItems.length === 0) {
      return;
    }

    const item = resolvedItems[currentFocus];
    if (!item) {
      return;
    }

    const nextItem = adjustSettingItem(item, state.stepEvents.x.direction);
    if (nextItem.value === item.value) {
      return;
    }

    const nextItems = replaceSettingItem(resolvedItems, currentFocus, nextItem);
    setResolvedItems(nextItems);
    setLastAction(state.stepEvents.x.direction > 0 ? "increase" : "decrease");
    onChange?.({
      index: currentFocus,
      direction: state.stepEvents.x.direction,
      item,
      nextItem,
      items: nextItems,
    });
  }, [
    currentFocus,
    onChange,
    resolvedItems,
    state.stepEvents.x.direction,
    state.stepEvents.x.sequence,
  ]);

  const focusedItem = resolvedItems[currentFocus];

  return (
    <Panel
      title={label}
      eyebrow="Direct adjust"
      description="Tilt up or down to choose a setting. Tilt left or right to nudge the focused value without opening another layer."
    >
      <MetricsGroup>
        <Metrics label="Status" value={formatStatus(state)} />
        <Metrics label="Focused" value={focusedItem?.label ?? "n/a"} />
        <Metrics
          label="Value"
          value={focusedItem ? formatSettingValue(focusedItem) : "n/a"}
        />
        <Metrics label="Action" value={lastAction} />
        <Metrics
          label="Intent"
          value={`${state.intentVector.x.toFixed(2)} / ${state.intentVector.y.toFixed(2)}`}
        />
      </MetricsGroup>
      <ol
        style={{
          marginTop: 0,
          paddingLeft: 0,
          listStyle: "none",
          display: "grid",
          gap: "10px",
        }}
      >
        {resolvedItems.map((item, index) => {
          const isFocused = index === currentFocus;

          return (
            <li
              key={item.id ?? item.label}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "12px",
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: "18px",
                border: isFocused
                  ? "1px solid rgba(125, 211, 252, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                background: isFocused
                  ? "linear-gradient(145deg, rgba(56, 189, 248, 0.18), rgba(255, 255, 255, 0.06))"
                  : "rgba(255, 255, 255, 0.05)",
                boxShadow: isFocused
                  ? "0 18px 36px rgba(56, 189, 248, 0.12)"
                  : "none",
              }}
            >
              <div style={{ display: "grid", gap: "3px" }}>
                <strong style={{ fontSize: "1rem" }}>{item.label}</strong>
                <span style={{ color: "rgba(226, 232, 240, 0.72)", fontSize: "0.9rem" }}>
                  {item.description ?? "Use left and right tilt to adjust this value."}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  justifyItems: "end",
                  gap: "4px",
                }}
              >
                <strong
                  style={{
                    color: isFocused ? "#f8fafc" : "rgba(248, 250, 252, 0.88)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {formatSettingValue(item)}
                </strong>
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: isFocused ? "#7dd3fc" : "rgba(191, 219, 254, 0.46)",
                  }}
                >
                  {isFocused ? "adjust left / right" : "browse"}
                </span>
              </div>
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
