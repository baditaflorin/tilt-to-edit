import { useEffect, useRef, useState } from "react";

import {
  createTiltEngine,
  type TiltEngine,
  type TiltEngineOptions,
  type TiltEngineSnapshot,
} from "@tilt-to-edit/core";

export interface UseTiltToEditOptions extends TiltEngineOptions {
  autoStart?: boolean;
}

export interface UseTiltToEditResult {
  engine: TiltEngine | null;
  snapshot: TiltEngineSnapshot;
  state: TiltEngineSnapshot;
  start: () => Promise<TiltEngineSnapshot | undefined>;
  pause: () => TiltEngineSnapshot | undefined;
  resume: () => Promise<TiltEngineSnapshot | undefined>;
  requestPermission: () => Promise<TiltEngineSnapshot | undefined>;
  calibrate: () => boolean;
  confirm: () => TiltEngineSnapshot | undefined;
  setArmed: (armed: boolean) => TiltEngineSnapshot | undefined;
}

export function useTiltToEdit(
  options: UseTiltToEditOptions = {},
): UseTiltToEditResult {
  const engineRef = useRef<TiltEngine | null>(null);
  const [snapshot, setSnapshot] = useState<TiltEngineSnapshot>(() => {
    const engine = createTiltEngine(options);
    engineRef.current = engine;
    return engine.getSnapshot();
  });

  useEffect(() => {
    const engine = createTiltEngine(options);
    const previousEngine = engineRef.current;
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());

    const unsubscribe = engine.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });

    if (options.autoStart !== false) {
      void engine.start();
    }

    previousEngine?.destroy();

    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [
    options.autoStart,
    options.backend,
    options.axisMode,
    options.deadZone,
    options.hysteresis,
    options.stepThreshold,
    options.repeatIntervalMs,
    options.continuousRange,
    options.smoothing,
    options.autoCalibrateOnStart,
    options.initialArmed,
    options.requireArmedForStep,
    options.screenOrientationProvider,
    options.now,
  ]);

  return {
    engine: engineRef.current,
    snapshot,
    state: snapshot,
    start: () => engineRef.current?.start() ?? Promise.resolve(undefined),
    pause: () => engineRef.current?.pause(),
    resume: () => engineRef.current?.resume() ?? Promise.resolve(undefined),
    requestPermission: () =>
      engineRef.current?.requestPermission() ?? Promise.resolve(undefined),
    calibrate: () => engineRef.current?.calibrate() ?? false,
    confirm: () => engineRef.current?.confirm(),
    setArmed: (armed) => engineRef.current?.setArmed(armed),
  };
}
