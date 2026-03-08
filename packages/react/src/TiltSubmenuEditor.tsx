import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";

import {
  adjustSettingItem,
  clampIndex,
  createItemIndexMap,
  formatSettingValue,
  replaceSectionSettingItem,
  type TiltSettingSection,
  type TiltSubmenuChangeEvent,
} from "./settings";
import { Controls, Diagnostics, Metrics, MetricsGroup, Panel, formatStatus } from "./ui";
import { useTiltToEdit } from "./useTiltToEdit";

type SubmenuMode = "sections" | "items" | "editor";

export interface TiltSubmenuEditorProps {
  label?: string;
  sections: TiltSettingSection[];
  backend?: TiltSensorBackend;
  requireArm?: boolean;
  stepThreshold?: number;
  initialSectionIndex?: number;
  initialItemIndex?: number;
  onChange?: (event: TiltSubmenuChangeEvent) => void;
}

export function TiltSubmenuEditor({
  label = "Tilt Submenu Editor",
  sections,
  backend,
  requireArm = false,
  stepThreshold = 8,
  initialSectionIndex = 0,
  initialItemIndex = 0,
  onChange,
}: TiltSubmenuEditorProps) {
  const { state, requestPermission, calibrate, pause, resume, setArmed } = useTiltToEdit({
    backend,
    axisMode: "both",
    smoothing: 0.74,
    stepThreshold,
    requireArmedForStep: requireArm,
  });
  const [resolvedSections, setResolvedSections] = useState(sections);
  const [sectionIndex, setSectionIndex] = useState(
    clampIndex(initialSectionIndex, sections.length),
  );
  const [itemIndices, setItemIndices] = useState(() =>
    createItemIndexMap(sections, initialItemIndex),
  );
  const [mode, setMode] = useState<SubmenuMode>("sections");
  const [lastAction, setLastAction] = useState("browse sections");
  const lastVerticalSequenceRef = useRef(state.stepEvents.y.sequence);
  const lastHorizontalSequenceRef = useRef(state.stepEvents.x.sequence);

  useEffect(() => {
    setResolvedSections(sections);
    setSectionIndex((currentIndex) => clampIndex(currentIndex, sections.length));
    setItemIndices((currentIndices) =>
      sections.map((section, currentSectionIndex) =>
        clampIndex(
          currentIndices[currentSectionIndex] ?? initialItemIndex,
          section.items.length,
        ),
      ),
    );
  }, [initialItemIndex, sections]);

  useEffect(() => {
    if (state.stepEvents.x.sequence === lastHorizontalSequenceRef.current) {
      return;
    }

    lastHorizontalSequenceRef.current = state.stepEvents.x.sequence;
    if (state.stepEvents.x.direction === 0) {
      return;
    }

    if (state.stepEvents.x.direction > 0) {
      setMode((currentMode) => {
        if (currentMode === "sections") {
          setLastAction("enter items");
          return "items";
        }

        if (currentMode === "items") {
          setLastAction("enter editor");
          return "editor";
        }

        return currentMode;
      });
      return;
    }

    setMode((currentMode) => {
      if (currentMode === "editor") {
        setLastAction("back to items");
        return "items";
      }

      if (currentMode === "items") {
        setLastAction("back to sections");
        return "sections";
      }

      return currentMode;
    });
  }, [
    state.stepEvents.x.direction,
    state.stepEvents.x.sequence,
  ]);

  useEffect(() => {
    if (state.stepEvents.y.sequence === lastVerticalSequenceRef.current) {
      return;
    }

    lastVerticalSequenceRef.current = state.stepEvents.y.sequence;
    if (state.stepEvents.y.direction === 0 || resolvedSections.length === 0) {
      return;
    }

    if (mode === "sections") {
      setSectionIndex((currentIndex) =>
        clampIndex(currentIndex + state.stepEvents.y.direction, resolvedSections.length),
      );
      setLastAction("browse sections");
      return;
    }

    if (mode === "items") {
      setItemIndices((currentIndices) =>
        currentIndices.map((itemIndex, currentSectionIndex) => {
          if (currentSectionIndex !== sectionIndex) {
            return itemIndex;
          }

          return clampIndex(
            itemIndex + state.stepEvents.y.direction,
            resolvedSections[sectionIndex]?.items.length ?? 0,
          );
        }),
      );
      setLastAction("browse items");
      return;
    }

    const section = resolvedSections[sectionIndex];
    const itemIndex = itemIndices[sectionIndex] ?? 0;
    const item = section?.items[itemIndex];
    if (!section || !item) {
      return;
    }

    const adjustmentDirection = state.stepEvents.y.direction > 0 ? -1 : 1;
    const nextItem = adjustSettingItem(item, adjustmentDirection);
    if (nextItem.value === item.value) {
      return;
    }

    const nextSections = replaceSectionSettingItem(
      resolvedSections,
      sectionIndex,
      itemIndex,
      nextItem,
    );
    setResolvedSections(nextSections);
    setLastAction(adjustmentDirection > 0 ? "increase value" : "decrease value");
    onChange?.({
      sectionIndex,
      itemIndex,
      direction: adjustmentDirection,
      section,
      item,
      nextItem,
      sections: nextSections,
    });
  }, [
    itemIndices,
    mode,
    onChange,
    resolvedSections,
    sectionIndex,
    state.stepEvents.y.direction,
    state.stepEvents.y.sequence,
  ]);

  const activeSection = resolvedSections[sectionIndex];
  const activeItemIndex = itemIndices[sectionIndex] ?? 0;
  const activeItem = activeSection?.items[activeItemIndex];

  return (
    <Panel
      title={label}
      eyebrow="Hierarchical menu"
      description="Use right tilt to go deeper, left tilt to back out, and vertical tilt to either browse or edit depending on the current lane."
    >
      <MetricsGroup>
        <Metrics label="Status" value={formatStatus(state)} />
        <Metrics label="Mode" value={mode} />
        <Metrics label="Section" value={activeSection?.label ?? "n/a"} />
        <Metrics label="Item" value={activeItem?.label ?? "n/a"} />
        <Metrics
          label="Value"
          value={activeItem ? formatSettingValue(activeItem) : "n/a"}
        />
        <Metrics label="Action" value={lastAction} />
      </MetricsGroup>
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <div
          style={{
            padding: "14px",
            borderRadius: "20px",
            border:
              mode === "sections"
                ? "1px solid rgba(125, 211, 252, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.08)",
            background:
              mode === "sections"
                ? "linear-gradient(145deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.42))"
                : "rgba(255, 255, 255, 0.04)",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: "#7dd3fc",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "0.7rem",
            }}
          >
            Level 1
          </p>
          <strong style={{ display: "block", marginBottom: "10px" }}>Sections</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "8px" }}>
            {resolvedSections.map((section, currentSectionIndex) => (
              <li
                key={section.id ?? section.label}
                style={{
                  padding: "10px 12px",
                  borderRadius: "14px",
                  background:
                    currentSectionIndex === sectionIndex
                      ? "rgba(125, 211, 252, 0.14)"
                      : "rgba(255, 255, 255, 0.04)",
                  border:
                    currentSectionIndex === sectionIndex
                      ? "1px solid rgba(125, 211, 252, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                {section.label}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "20px",
            border:
              mode === "items"
                ? "1px solid rgba(251, 191, 36, 0.38)"
                : "1px solid rgba(255, 255, 255, 0.08)",
            background:
              mode === "items"
                ? "linear-gradient(145deg, rgba(251, 191, 36, 0.1), rgba(15, 23, 42, 0.42))"
                : "rgba(255, 255, 255, 0.04)",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: "#fbbf24",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "0.7rem",
            }}
          >
            Level 2
          </p>
          <strong style={{ display: "block", marginBottom: "10px" }}>Items</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "8px" }}>
            {(activeSection?.items ?? []).map((item, currentItemIndex) => (
              <li
                key={item.id ?? item.label}
                style={{
                  padding: "10px 12px",
                  borderRadius: "14px",
                  background:
                    currentItemIndex === activeItemIndex
                      ? "rgba(251, 191, 36, 0.14)"
                      : "rgba(255, 255, 255, 0.04)",
                  border:
                    currentItemIndex === activeItemIndex
                      ? "1px solid rgba(251, 191, 36, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                  <span>{item.label}</span>
                  <span style={{ color: "rgba(248, 250, 252, 0.78)" }}>
                    {formatSettingValue(item)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "20px",
            border:
              mode === "editor"
                ? "1px solid rgba(74, 222, 128, 0.34)"
                : "1px solid rgba(255, 255, 255, 0.08)",
            background:
              mode === "editor"
                ? "linear-gradient(145deg, rgba(74, 222, 128, 0.1), rgba(15, 23, 42, 0.42))"
                : "rgba(255, 255, 255, 0.04)",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: "#4ade80",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "0.7rem",
            }}
          >
            Level 3
          </p>
          <strong style={{ display: "block", marginBottom: "10px" }}>Editor</strong>
          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <span style={{ color: "rgba(191, 219, 254, 0.72)", display: "block" }}>
                Current target
              </span>
              <strong style={{ fontSize: "1.1rem" }}>{activeItem?.label ?? "n/a"}</strong>
            </div>
            <div>
              <span style={{ color: "rgba(191, 219, 254, 0.72)", display: "block" }}>
                Live value
              </span>
              <strong
                style={{
                  fontSize: "1.4rem",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                {activeItem ? formatSettingValue(activeItem) : "n/a"}
              </strong>
            </div>
            <p style={{ margin: 0, color: "rgba(226, 232, 240, 0.76)" }}>
              Right enters. Left backs out. Once this lane is active, tilt up to
              increase and tilt down to decrease.
            </p>
          </div>
        </div>
      </div>
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
