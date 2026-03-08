import { useEffect, useRef, useState } from "react";

import {
  createDeviceOrientationBackend,
  type TiltSensorBackend,
} from "@tilt-to-edit/core";
import { useTiltToEdit } from "@tilt-to-edit/react";

interface MotionState {
  speed: number;
  velocityX: number;
  velocityY: number;
  hue: number;
}

interface TrailPoint extends MotionState {
  id: number;
  x: number;
  y: number;
  z: number;
}

type LastAction = "browse" | "committed" | "returned";

const MENU_ITEMS = [
  "Brightness",
  "Contrast",
  "Theme",
  "Ambient audio",
  "Focus mode",
];

const BROWSE_TRIGGER = 0.48;
const BROWSE_RESET = 0.18;
const ACTION_TRIGGER = 0.58;
const ACTION_RESET = 0.22;
const BROWSE_COOLDOWN_MS = 420;
const ACTION_COOLDOWN_MS = 520;

export interface AppProps {
  backend?: TiltSensorBackend;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

function getHue(velocityX: number, velocityY: number) {
  return ((toDegrees(Math.atan2(velocityY, velocityX)) % 360) + 360) % 360;
}

function formatSigned(value: number) {
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

export function App({ backend }: AppProps) {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [highlightedIndex, setHighlightedIndex] = useState(2);
  const [lastAction, setLastAction] = useState<LastAction>("browse");
  const [liveBackend] = useState<TiltSensorBackend>(
    () => backend ?? createDeviceOrientationBackend(),
  );
  const resolvedBackend = backend ?? liveBackend;
  const { state, requestPermission, calibrate, confirm, pause, resume } =
    useTiltToEdit({
      backend: resolvedBackend,
      axisMode: "both",
      deadZone: 2,
      smoothing: 0.84,
      continuousRange: 24,
    });
  const previousRef = useRef<{ x: number; y: number; timestamp: number } | null>(
    null,
  );
  const browseLockedRef = useRef(false);
  const actionLockedRef = useRef(false);
  const lastBrowseAtRef = useRef(-Infinity);
  const lastActionAtRef = useRef(-Infinity);
  const [motion, setMotion] = useState<MotionState>({
    speed: 0,
    velocityX: 0,
    velocityY: 0,
    hue: 210,
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    const sample = state.lastSample;
    if (!sample) {
      return;
    }

    const timestamp = sample.timestamp;
    const { x, y } = state.intentVector;

    if (browseLockedRef.current && Math.abs(y) <= BROWSE_RESET) {
      browseLockedRef.current = false;
    }

    if (actionLockedRef.current && Math.abs(x) <= ACTION_RESET) {
      actionLockedRef.current = false;
    }

    const verticalDominant = Math.abs(y) > Math.abs(x) + 0.12;
    const browseReady =
      !browseLockedRef.current &&
      verticalDominant &&
      Math.abs(y) >= BROWSE_TRIGGER &&
      timestamp - lastBrowseAtRef.current >= BROWSE_COOLDOWN_MS;

    if (browseReady) {
      const direction = y > 0 ? 1 : -1;
      browseLockedRef.current = true;
      lastBrowseAtRef.current = timestamp;
      setLastAction("browse");
      setHighlightedIndex((currentIndex) =>
        clamp(currentIndex + direction, 0, MENU_ITEMS.length - 1),
      );
      return;
    }

    const horizontalDominant =
      Math.abs(x) > Math.abs(y) + 0.18 && Math.abs(y) <= 0.32;
    const actionReady =
      !actionLockedRef.current &&
      horizontalDominant &&
      Math.abs(x) >= ACTION_TRIGGER &&
      timestamp - lastActionAtRef.current >= ACTION_COOLDOWN_MS;

    if (!actionReady) {
      return;
    }

    actionLockedRef.current = true;
    lastActionAtRef.current = timestamp;

    if (x > 0) {
      confirm();
      setSelectedIndex(highlightedIndex);
      setLastAction("committed");
      return;
    }

    setHighlightedIndex(selectedIndex);
    setLastAction("returned");
  }, [
    confirm,
    highlightedIndex,
    selectedIndex,
    state.intentVector.x,
    state.intentVector.y,
    state.lastSample,
  ]);

  useEffect(() => {
    const sample = state.lastSample;
    if (!sample) {
      return;
    }

    const current = {
      x: state.intentVector.x,
      y: state.intentVector.y,
      timestamp: sample.timestamp,
    };
    const previous = previousRef.current;
    previousRef.current = current;

    if (!previous || previous.timestamp === current.timestamp) {
      return;
    }

    const elapsedMs = Math.max(current.timestamp - previous.timestamp, 1);
    const velocityX = ((current.x - previous.x) / elapsedMs) * 1000;
    const velocityY = ((current.y - previous.y) / elapsedMs) * 1000;
    const rawSpeed = Math.hypot(velocityX, velocityY);
    const speed = clamp(rawSpeed, 0, 8);
    const normalizedSpeed = clamp(speed / 8, 0, 1);
    const hue = getHue(velocityX, velocityY);
    const trailPoint: TrailPoint = {
      id: current.timestamp,
      x: current.x,
      y: current.y,
      z: 20 + normalizedSpeed * 70,
      speed,
      velocityX,
      velocityY,
      hue,
    };

    setMotion({
      speed,
      velocityX,
      velocityY,
      hue,
    });
    setTrail((currentTrail) => [...currentTrail.slice(-8), trailPoint]);
  }, [state.intentVector.x, state.intentVector.y, state.lastSample?.timestamp]);

  const speedRatio = clamp(motion.speed / 8, 0, 1);
  const chamber = {
    orbX: state.intentVector.x * 92,
    orbY: 172 + state.intentVector.y * 28,
    orbZ: 18 + speedRatio * 44,
    beamAngle: toDegrees(
      Math.atan2(motion.velocityY || 0.0001, motion.velocityX || 0.0001),
    ),
    beamLength: 34 + speedRatio * 90,
    glowColor: `hsla(${motion.hue}, 100%, ${68 + speedRatio * 10}%, 0.95)`,
    beamColor: `hsla(${motion.hue}, 100%, ${60 + speedRatio * 18}%, ${0.28 + speedRatio * 0.44})`,
    shadowColor: `hsla(${motion.hue}, 100%, 60%, ${0.16 + speedRatio * 0.28})`,
    browseGlow: clamp(Math.abs(state.intentVector.y), 0.12, 1),
    commitGlow: clamp(Math.max(state.intentVector.x, 0), 0.1, 1),
    returnGlow: clamp(Math.max(-state.intentVector.x, 0), 0.1, 1),
  };

  return (
    <main className="shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy-wrap">
          <p className="eyebrow">3D Hybrid Control</p>
          <h1>React Vector Space</h1>
          <p className="hero-copy">
            A mobile-first spatial menu with slower browse cadence: one vertical
            lean moves one card, then you recenter before the next move. Right
            commits the focused item. Left returns to the live selection.
          </p>
          <a className="back-link" href="../">
            View all demos
          </a>
        </div>

        <section className="ritual-panel">
          <p className="micro-label">How it behaves</p>
          <ol>
            <li>Tap <strong>Enable tilt</strong> if needed, then calibrate.</li>
            <li>Lean gently up or down for a single move.</li>
            <li>Re-center to unlock the next item.</li>
            <li>Lean right to commit, or left to return.</li>
          </ol>
          <div className="action-row">
            {state.status === "needs-permission" ? (
              <button
                onClick={() => {
                  void requestPermission();
                }}
                type="button"
              >
                Enable tilt
              </button>
            ) : null}
            <button
              onClick={() => {
                calibrate();
              }}
              type="button"
            >
              Calibrate
            </button>
            {state.status === "active" ? (
              <button
                onClick={() => {
                  pause();
                }}
                type="button"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => {
                  void resume();
                }}
                type="button"
              >
                Resume
              </button>
            )}
          </div>
        </section>
      </header>

      <section className="experience-grid">
        <section className="space-card">
          <div className="card-head">
            <div>
              <p className="micro-label">Spatial menu</p>
              <h2>Precision stack</h2>
            </div>
            <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
          </div>

          <p className="space-copy">
            The center column is tuned for deliberate browsing. The side wings
            only light up when your phone is stable enough for commit or return.
          </p>

          <div className="space-stage">
            <div className="scene-label label-left">Return</div>
            <div className="scene-label label-center">Re-center between moves</div>
            <div className="scene-label label-right">Commit</div>

            <div className="space-room">
              <div className="space-backdrop" />
              <div className="space-floor" />

              <div
                className="focus-column"
                style={{
                  boxShadow: `0 0 80px rgba(96, 165, 250, ${0.1 + chamber.browseGlow * 0.18})`,
                }}
              />
              <div
                className="action-wing wing-left"
                style={{
                  opacity: chamber.returnGlow,
                  boxShadow: `0 0 44px rgba(244, 114, 182, ${0.16 + chamber.returnGlow * 0.36})`,
                }}
              />
              <div
                className="action-wing wing-right"
                style={{
                  opacity: chamber.commitGlow,
                  boxShadow: `0 0 44px rgba(56, 189, 248, ${0.16 + chamber.commitGlow * 0.36})`,
                }}
              />

              <div className="focus-halo" />

              {MENU_ITEMS.map((item, index) => {
                const relative = index - highlightedIndex;
                const isHighlighted = index === highlightedIndex;
                const isSelected = index === selectedIndex;
                const y = relative * 98 - state.intentVector.y * 22;
                const z = 140 - Math.abs(relative) * 72;
                const x = isHighlighted ? state.intentVector.x * 18 : relative * 8;
                const scale = clamp(1.06 - Math.abs(relative) * 0.12, 0.58, 1.06);
                const opacity = clamp(1 - Math.abs(relative) * 0.22, 0.22, 1);
                const blur = Math.abs(relative) * 0.6;
                const hue = isHighlighted
                  ? motion.hue
                  : (motion.hue + relative * 20 + 360) % 360;
                const summary = isSelected
                  ? "Current live choice"
                  : isHighlighted
                    ? "Ready to commit"
                    : relative < 0
                      ? `${Math.abs(relative)} step${Math.abs(relative) > 1 ? "s" : ""} above`
                      : `${relative} step${Math.abs(relative) > 1 ? "s" : ""} below`;

                return (
                  <article
                    key={item}
                    className={`menu-card${isHighlighted ? " is-highlighted" : ""}${isSelected ? " is-selected" : ""}`}
                    style={{
                      opacity,
                      filter: `blur(${blur}px) saturate(${1 - Math.min(blur * 0.08, 0.24)})`,
                      transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${relative * -4}deg) rotateY(${state.intentVector.x * 6}deg) scale(${scale})`,
                      borderColor: isHighlighted
                        ? `hsla(${hue}, 100%, 76%, 0.86)`
                        : isSelected
                          ? "rgba(245, 158, 11, 0.64)"
                          : "rgba(255, 255, 255, 0.08)",
                      boxShadow: isHighlighted
                        ? `0 24px 68px hsla(${hue}, 100%, 60%, 0.22), 0 0 44px hsla(${hue}, 100%, 66%, 0.22)`
                        : isSelected
                          ? "0 22px 60px rgba(245, 158, 11, 0.18)"
                          : "0 18px 44px rgba(5, 10, 24, 0.22)",
                    }}
                  >
                    <div className="menu-card-head">
                      <span className="menu-card-title">{item}</span>
                      {isSelected ? (
                        <span className="menu-pill is-selected-pill">Live</span>
                      ) : isHighlighted ? (
                        <span className="menu-pill is-highlighted-pill">Focus</span>
                      ) : null}
                    </div>
                    <p className="menu-card-copy">{summary}</p>
                  </article>
                );
              })}

              <div
                className="motion-line"
                style={{
                  width: `${chamber.beamLength}px`,
                  transform: `translate(-50%, -50%) translate3d(${chamber.orbX}px, ${chamber.orbY}px, ${chamber.orbZ}px) rotate(${chamber.beamAngle}deg)`,
                  boxShadow: `0 0 24px ${chamber.beamColor}`,
                  background: `linear-gradient(90deg, rgba(255,255,255,0.04), ${chamber.beamColor})`,
                }}
              />
              {trail.map((point, index) => {
                const opacity = (index + 1) / trail.length;
                const scale = 0.42 + opacity * 0.76;
                return (
                  <div
                    key={point.id}
                    className="trail-point"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${point.x * 92}px, ${172 + point.y * 28}px, ${point.z}px) scale(${scale})`,
                      background: `hsla(${point.hue}, 100%, 68%, ${0.24 + opacity * 0.44})`,
                      boxShadow: `0 0 ${12 + opacity * 18}px hsla(${point.hue}, 100%, 64%, ${0.16 + opacity * 0.34})`,
                    }}
                  />
                );
              })}
              <div
                className="vector-orb"
                data-testid="vector-orb"
                style={{
                  transform: `translate(-50%, -50%) translate3d(${chamber.orbX}px, ${chamber.orbY}px, ${chamber.orbZ}px)`,
                  background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${chamber.glowColor} 34%, rgba(10, 16, 30, 0.76) 100%)`,
                  boxShadow: `0 0 34px ${chamber.glowColor}, 0 0 72px ${chamber.shadowColor}`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="metrics-card">
          <div className="card-head">
            <div>
              <p className="micro-label">Control state</p>
              <h2>Telemetry</h2>
            </div>
          </div>

          <div className="metric-grid">
            <div>
              <span>Status</span>
              <strong>{state.status}</strong>
            </div>
            <div>
              <span>Selected</span>
              <strong>{MENU_ITEMS[selectedIndex]}</strong>
            </div>
            <div>
              <span>Highlighted</span>
              <strong>{MENU_ITEMS[highlightedIndex]}</strong>
            </div>
            <div>
              <span>Action</span>
              <strong>{lastAction}</strong>
            </div>
            <div>
              <span>Intent</span>
              <strong>
                {formatSigned(state.intentVector.x)} /{" "}
                {formatSigned(state.intentVector.y)}
              </strong>
            </div>
            <div>
              <span>Speed</span>
              <strong>{motion.speed.toFixed(2)}</strong>
            </div>
            <div>
              <span>Trail</span>
              <strong>{trail.length}</strong>
            </div>
            <div>
              <span>Confirmations</span>
              <strong>{state.confirmationSequence}</strong>
            </div>
          </div>

          <div className="legend">
            <div>
              <span className="legend-swatch browse" />
              <p>One vertical lean equals one move. Re-center before the next.</p>
            </div>
            <div>
              <span className="legend-swatch commit" />
              <p>The commit wing only brightens when right tilt is stable enough.</p>
            </div>
            <div>
              <span className="legend-swatch return" />
              <p>Left tilt safely snaps focus back to the committed choice.</p>
            </div>
          </div>

          {state.diagnostics.length > 0 ? (
            <ul className="diagnostics">
              {state.diagnostics.map((diagnostic) => (
                <li key={`${diagnostic.code}-${diagnostic.message}`}>
                  {diagnostic.message}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
}
