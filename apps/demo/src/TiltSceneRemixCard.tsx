import { useEffect, useRef, useState } from "react";

import type { TiltSensorBackend } from "@tilt-to-edit/core";
import { useTiltToEdit } from "@tilt-to-edit/react";

interface SceneOption {
  name: string;
  summary: string;
  background: string;
  glow: string;
  surface: string;
  accent: string;
  chip: string;
  skyline: string;
  shadow: string;
}

interface CharacterOption {
  name: string;
  role: string;
  aura: string;
  coat: string;
  core: string;
  skin: string;
  chip: string;
  shadow: string;
}

const BACKDROPS = [
  {
    name: "Neon Alley",
    summary: "Wet street, electric cyan",
    background:
      "linear-gradient(180deg, #071120 0%, #0c2140 42%, #120d2c 100%)",
    glow:
      "radial-gradient(circle at 50% 24%, rgba(34, 211, 238, 0.34), transparent 54%)",
    surface: "rgba(45, 212, 191, 0.3)",
    accent: "rgba(34, 211, 238, 0.86)",
    chip: "rgba(34, 211, 238, 0.16)",
    skyline: "rgba(103, 232, 249, 0.2)",
    shadow: "rgba(34, 211, 238, 0.16)",
  },
  {
    name: "Solar Dunes",
    summary: "Dust haze, amber heat",
    background:
      "linear-gradient(180deg, #1a1022 0%, #4c2c22 40%, #140d16 100%)",
    glow:
      "radial-gradient(circle at 50% 22%, rgba(251, 191, 36, 0.3), transparent 52%)",
    surface: "rgba(251, 191, 36, 0.24)",
    accent: "rgba(251, 191, 36, 0.9)",
    chip: "rgba(251, 191, 36, 0.16)",
    skyline: "rgba(253, 224, 71, 0.18)",
    shadow: "rgba(251, 191, 36, 0.16)",
  },
  {
    name: "Rain Archive",
    summary: "Glass towers, violet weather",
    background:
      "linear-gradient(180deg, #090d1f 0%, #1e1b4b 42%, #120f29 100%)",
    glow:
      "radial-gradient(circle at 50% 20%, rgba(167, 139, 250, 0.32), transparent 52%)",
    surface: "rgba(129, 140, 248, 0.26)",
    accent: "rgba(167, 139, 250, 0.88)",
    chip: "rgba(167, 139, 250, 0.16)",
    skyline: "rgba(196, 181, 253, 0.18)",
    shadow: "rgba(167, 139, 250, 0.16)",
  },
  {
    name: "Forest Shrine",
    summary: "Mist, moss, biolights",
    background:
      "linear-gradient(180deg, #071814 0%, #0f3c35 38%, #09131a 100%)",
    glow:
      "radial-gradient(circle at 50% 22%, rgba(74, 222, 128, 0.3), transparent 54%)",
    surface: "rgba(74, 222, 128, 0.24)",
    accent: "rgba(74, 222, 128, 0.88)",
    chip: "rgba(74, 222, 128, 0.16)",
    skyline: "rgba(134, 239, 172, 0.18)",
    shadow: "rgba(74, 222, 128, 0.16)",
  },
] satisfies readonly [SceneOption, ...SceneOption[]];

const CHARACTERS = [
  {
    name: "Pilot",
    role: "Street runner",
    aura: "rgba(56, 189, 248, 0.34)",
    coat: "#0f172a",
    core: "#38bdf8",
    skin: "#f1d0b6",
    chip: "rgba(56, 189, 248, 0.16)",
    shadow: "rgba(56, 189, 248, 0.22)",
  },
  {
    name: "Oracle",
    role: "Signal reader",
    aura: "rgba(244, 114, 182, 0.34)",
    coat: "#3b0764",
    core: "#f472b6",
    skin: "#f3d7c0",
    chip: "rgba(244, 114, 182, 0.16)",
    shadow: "rgba(244, 114, 182, 0.22)",
  },
  {
    name: "Drifter",
    role: "Sand scout",
    aura: "rgba(251, 191, 36, 0.34)",
    coat: "#422006",
    core: "#fbbf24",
    skin: "#e8c29b",
    chip: "rgba(251, 191, 36, 0.16)",
    shadow: "rgba(251, 191, 36, 0.22)",
  },
  {
    name: "Archivist",
    role: "Memory keeper",
    aura: "rgba(45, 212, 191, 0.34)",
    coat: "#062c30",
    core: "#2dd4bf",
    skin: "#f3d3bc",
    chip: "rgba(45, 212, 191, 0.16)",
    shadow: "rgba(45, 212, 191, 0.22)",
  },
] satisfies readonly [CharacterOption, ...CharacterOption[]];

const X_TRIGGER = 0.48;
const X_RESET = 0.2;
const X_COOLDOWN_MS = 440;
const Y_TRIGGER = 0.52;
const Y_RESET = 0.22;
const Y_COOLDOWN_MS = 460;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

export interface TiltSceneRemixCardProps {
  backend?: TiltSensorBackend;
}

export function TiltSceneRemixCard({ backend }: TiltSceneRemixCardProps) {
  const { state, requestPermission, calibrate } = useTiltToEdit({
    backend,
    axisMode: "both",
    deadZone: 2,
    smoothing: 0.8,
    continuousRange: 20,
  });
  const [backdropIndex, setBackdropIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const xLockedRef = useRef(false);
  const yLockedRef = useRef(false);
  const lastXAtRef = useRef(-Infinity);
  const lastYAtRef = useRef(-Infinity);

  useEffect(() => {
    const sample = state.lastSample;
    if (!sample) {
      return;
    }

    const { x, y } = state.intentVector;
    const timestamp = sample.timestamp;

    if (xLockedRef.current && Math.abs(x) <= X_RESET) {
      xLockedRef.current = false;
    }

    if (yLockedRef.current && Math.abs(y) <= Y_RESET) {
      yLockedRef.current = false;
    }

    const horizontalDominant = Math.abs(x) > Math.abs(y) + 0.08;
    const backdropReady =
      !xLockedRef.current &&
      horizontalDominant &&
      Math.abs(x) >= X_TRIGGER &&
      timestamp - lastXAtRef.current >= X_COOLDOWN_MS;

    if (backdropReady) {
      xLockedRef.current = true;
      lastXAtRef.current = timestamp;
      setBackdropIndex((currentIndex) =>
        wrapIndex(currentIndex + (x > 0 ? 1 : -1), BACKDROPS.length),
      );
      return;
    }

    const verticalDominant = Math.abs(y) > Math.abs(x) + 0.12;
    const characterReady =
      !yLockedRef.current &&
      verticalDominant &&
      Math.abs(y) >= Y_TRIGGER &&
      timestamp - lastYAtRef.current >= Y_COOLDOWN_MS;

    if (characterReady) {
      yLockedRef.current = true;
      lastYAtRef.current = timestamp;
      setCharacterIndex((currentIndex) =>
        wrapIndex(currentIndex + (y > 0 ? 1 : -1), CHARACTERS.length),
      );
    }
  }, [state.intentVector.x, state.intentVector.y, state.lastSample]);

  const backdrop = BACKDROPS[backdropIndex] ?? BACKDROPS[0];
  const character = CHARACTERS[characterIndex] ?? CHARACTERS[0];
  const orbitX = state.intentVector.x * 18;
  const orbitY = state.intentVector.y * -12;
  const beamWidth = 52 + clamp(Math.hypot(state.intentVector.x, state.intentVector.y), 0, 1) * 68;

  return (
    <section className="aurora-card story-remix-card">
      <div className="section-head">
        <div>
          <p className="micro-label">Image-style scene edit</p>
          <h2>Tilt Scene Remix</h2>
          <p>
            Tilt left or right to swap the world. Tilt up or down to cast a new
            character. The preview updates live like a fast concept remix.
          </p>
        </div>
        <strong className={`status-badge status-${state.status}`}>{state.status}</strong>
      </div>

      <div
        className="scene-preview"
        style={{
          background: backdrop.background,
          boxShadow: `0 32px 72px ${backdrop.shadow}`,
        }}
      >
        <div className="scene-preview-glow" style={{ background: backdrop.glow }} />
        <div className="scene-preview-grid" />
        <div className="scene-preview-skyline" style={{ color: backdrop.skyline }}>
          <span className="skyline-tower tower-a" />
          <span className="skyline-tower tower-b" />
          <span className="skyline-tower tower-c" />
          <span className="skyline-tower tower-d" />
        </div>
        <div
          className="scene-preview-ground"
          style={{
            background: `linear-gradient(180deg, ${backdrop.surface}, rgba(255,255,255,0.02))`,
          }}
        />
        <div
          className="scene-preview-beam"
          style={{
            width: `${beamWidth}px`,
            background: `linear-gradient(90deg, rgba(255,255,255,0.04), ${backdrop.accent})`,
            boxShadow: `0 0 24px ${backdrop.accent}`,
            transform: `translate(${orbitX}px, ${orbitY}px) rotate(${state.intentVector.x * 26}deg)`,
          }}
        />

        <div
          className="scene-preview-character"
          style={{
            transform: `translate(${orbitX * 0.65}px, ${orbitY * 0.45}px)`,
          }}
        >
          <div
            className="scene-character-aura"
            style={{ background: `radial-gradient(circle, ${character.aura} 0%, transparent 68%)` }}
          />
          <div
            className="scene-character-shadow"
            style={{ boxShadow: `0 0 48px ${character.shadow}` }}
          />
          <div className="scene-character-head" style={{ background: character.skin }} />
          <div
            className="scene-character-body"
            style={{
              background: `linear-gradient(180deg, ${character.coat}, ${character.core})`,
            }}
          />
          <div
            className="scene-character-core"
            style={{
              background: character.core,
              boxShadow: `0 0 18px ${character.core}, 0 0 34px ${character.aura}`,
            }}
          />
        </div>

        <div className="scene-preview-ui">
          <div>
            <span className="scene-ui-label">World</span>
            <strong>{backdrop.name}</strong>
            <p>{backdrop.summary}</p>
          </div>
          <div>
            <span className="scene-ui-label">Character</span>
            <strong>{character.name}</strong>
            <p>{character.role}</p>
          </div>
        </div>
      </div>

      <div className="scene-track-grid">
        <div className="scene-track">
          <span className="scene-track-label">Backdrop on X axis</span>
          <div className="scene-chip-row">
            {BACKDROPS.map((item, index) => (
              <div
                key={item.name}
                className={`scene-chip${index === backdropIndex ? " is-active" : ""}`}
                style={{
                  background: index === backdropIndex ? item.chip : "rgba(255, 255, 255, 0.05)",
                  borderColor:
                    index === backdropIndex
                      ? "rgba(255, 255, 255, 0.24)"
                      : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <strong>{item.name}</strong>
                <span>{item.summary}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="scene-track">
          <span className="scene-track-label">Character on Y axis</span>
          <div className="scene-chip-row">
            {CHARACTERS.map((item, index) => (
              <div
                key={item.name}
                className={`scene-chip${index === characterIndex ? " is-active" : ""}`}
                style={{
                  background: index === characterIndex ? item.chip : "rgba(255, 255, 255, 0.05)",
                  borderColor:
                    index === characterIndex
                      ? "rgba(255, 255, 255, 0.24)"
                      : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="metric-strip">
        <div>
          <span>Backdrop</span>
          <strong>{backdrop.name}</strong>
        </div>
        <div>
          <span>Character</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Intent X</span>
          <strong>{state.intentVector.x.toFixed(2)}</strong>
        </div>
        <div>
          <span>Intent Y</span>
          <strong>{state.intentVector.y.toFixed(2)}</strong>
        </div>
      </div>

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
          Calibrate scene
        </button>
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
  );
}
