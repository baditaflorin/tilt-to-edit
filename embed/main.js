const BACKDROPS = [
    {
        name: "Neon Alley",
        summary: "Wet street, electric cyan",
        background: "linear-gradient(180deg, #071120 0%, #0c2140 42%, #120d2c 100%)",
        glow: "radial-gradient(circle at 50% 24%, rgba(34, 211, 238, 0.34), transparent 54%)",
        surface: "rgba(45, 212, 191, 0.3)",
        skyline: "rgba(103, 232, 249, 0.22)",
        accent: "rgba(34, 211, 238, 0.88)",
    },
    {
        name: "Solar Dunes",
        summary: "Dust haze, amber heat",
        background: "linear-gradient(180deg, #1a1022 0%, #4c2c22 40%, #140d16 100%)",
        glow: "radial-gradient(circle at 50% 22%, rgba(251, 191, 36, 0.3), transparent 52%)",
        surface: "rgba(251, 191, 36, 0.24)",
        skyline: "rgba(253, 224, 71, 0.18)",
        accent: "rgba(251, 191, 36, 0.9)",
    },
    {
        name: "Rain Archive",
        summary: "Glass towers, violet weather",
        background: "linear-gradient(180deg, #090d1f 0%, #1e1b4b 42%, #120f29 100%)",
        glow: "radial-gradient(circle at 50% 20%, rgba(167, 139, 250, 0.32), transparent 52%)",
        surface: "rgba(129, 140, 248, 0.26)",
        skyline: "rgba(196, 181, 253, 0.18)",
        accent: "rgba(167, 139, 250, 0.88)",
    },
    {
        name: "Forest Shrine",
        summary: "Mist, moss, biolights",
        background: "linear-gradient(180deg, #071814 0%, #0f3c35 38%, #09131a 100%)",
        glow: "radial-gradient(circle at 50% 22%, rgba(74, 222, 128, 0.3), transparent 54%)",
        surface: "rgba(74, 222, 128, 0.24)",
        skyline: "rgba(134, 239, 172, 0.18)",
        accent: "rgba(74, 222, 128, 0.88)",
    },
];
const CHARACTERS = [
    {
        name: "Pilot",
        summary: "Street runner",
        aura: "rgba(56, 189, 248, 0.34)",
        coat: "#0f172a",
        core: "#38bdf8",
        skin: "#f1d0b6",
        shadow: "rgba(56, 189, 248, 0.22)",
    },
    {
        name: "Oracle",
        summary: "Signal reader",
        aura: "rgba(244, 114, 182, 0.34)",
        coat: "#3b0764",
        core: "#f472b6",
        skin: "#f3d7c0",
        shadow: "rgba(244, 114, 182, 0.22)",
    },
    {
        name: "Drifter",
        summary: "Sand scout",
        aura: "rgba(251, 191, 36, 0.34)",
        coat: "#422006",
        core: "#fbbf24",
        skin: "#e8c29b",
        shadow: "rgba(251, 191, 36, 0.22)",
    },
    {
        name: "Archivist",
        summary: "Memory keeper",
        aura: "rgba(45, 212, 191, 0.34)",
        coat: "#062c30",
        core: "#2dd4bf",
        skin: "#f3d3bc",
        shadow: "rgba(45, 212, 191, 0.22)",
    },
];
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function wrapIndex(index, length) {
    return (index + length) % length;
}
function requireElement(id) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Scene embed demo markup is missing #${id}.`);
    }
    return element;
}
const scenePreview = requireElement("scene-preview");
const sceneGlow = requireElement("scene-glow");
const sceneSkyline = requireElement("scene-skyline");
const sceneGround = requireElement("scene-ground");
const sceneBeam = requireElement("scene-beam");
const worldName = requireElement("world-name");
const worldSummary = requireElement("world-summary");
const characterName = requireElement("character-name");
const characterSummary = requireElement("character-summary");
const characterAura = requireElement("character-aura");
const characterShadow = requireElement("character-shadow");
const characterHead = requireElement("character-head");
const characterBody = requireElement("character-body");
const characterCore = requireElement("character-core");
const characterRoot = requireElement("scene-character");
const api = window.TiltToEdit;
if (!api) {
    throw new Error("TiltToEdit global was not found. Make sure the IIFE bundle loads first.");
}
const instances = api.getInstances().length > 0 ? api.getInstances() : api.scan(document);
const sceneDriver = document.getElementById("scene-driver");
const menuDriver = document.getElementById("menu-driver");
if (!sceneDriver || !menuDriver) {
    throw new Error("Script-tag embed hosts are missing.");
}
let backdropIndex = 0;
let characterIndex = 0;
let xLocked = false;
let yLocked = false;
let lastXAt = Number.NEGATIVE_INFINITY;
let lastYAt = Number.NEGATIVE_INFINITY;
function renderScene() {
    const backdrop = BACKDROPS[backdropIndex] ?? BACKDROPS[0];
    const character = CHARACTERS[characterIndex] ?? CHARACTERS[0];
    scenePreview.setAttribute("style", `background: ${backdrop.background}; box-shadow: 0 32px 72px rgba(8, 15, 28, 0.44);`);
    sceneGlow.setAttribute("style", `background: ${backdrop.glow};`);
    sceneSkyline.setAttribute("style", `color: ${backdrop.skyline};`);
    sceneGround.setAttribute("style", `background: linear-gradient(180deg, ${backdrop.surface}, rgba(255,255,255,0.02));`);
    sceneBeam.setAttribute("style", `background: linear-gradient(90deg, rgba(255,255,255,0.04), ${backdrop.accent}); box-shadow: 0 0 24px ${backdrop.accent};`);
    worldName.textContent = backdrop.name;
    worldSummary.textContent = backdrop.summary;
    characterName.textContent = character.name;
    characterSummary.textContent = character.summary;
    characterAura.setAttribute("style", `background: radial-gradient(circle, ${character.aura} 0%, transparent 68%);`);
    characterShadow.setAttribute("style", `box-shadow: 0 0 48px ${character.shadow};`);
    characterHead.setAttribute("style", `background: ${character.skin};`);
    characterBody.setAttribute("style", `background: linear-gradient(180deg, ${character.coat}, ${character.core});`);
    characterCore.setAttribute("style", `background: ${character.core}; box-shadow: 0 0 18px ${character.core}, 0 0 34px ${character.aura};`);
}
function requestAllPermission() {
    return Promise.all(instances.map((instance) => instance.requestPermission()));
}
function calibrateAll() {
    for (const instance of instances) {
        instance.calibrate();
    }
}
document.getElementById("enable-all")?.addEventListener("click", () => {
    void requestAllPermission();
});
document.getElementById("calibrate-all")?.addEventListener("click", () => {
    calibrateAll();
});
sceneDriver.addEventListener("tilt-to-edit:state", (event) => {
    const detail = event;
    const sample = detail.detail.snapshot.lastSample;
    if (!sample) {
        return;
    }
    const { x, y } = detail.detail.snapshot.intentVector;
    const timestamp = sample.timestamp;
    if (xLocked && Math.abs(x) <= 0.2) {
        xLocked = false;
    }
    if (yLocked && Math.abs(y) <= 0.22) {
        yLocked = false;
    }
    const horizontalDominant = Math.abs(x) > Math.abs(y) + 0.08;
    if (!xLocked && horizontalDominant && Math.abs(x) >= 0.48 && timestamp - lastXAt >= 440) {
        xLocked = true;
        lastXAt = timestamp;
        backdropIndex = wrapIndex(backdropIndex + (x > 0 ? 1 : -1), BACKDROPS.length);
        renderScene();
    }
    const verticalDominant = Math.abs(y) > Math.abs(x) + 0.12;
    if (!yLocked && verticalDominant && Math.abs(y) >= 0.52 && timestamp - lastYAt >= 460) {
        yLocked = true;
        lastYAt = timestamp;
        characterIndex = wrapIndex(characterIndex + (y > 0 ? 1 : -1), CHARACTERS.length);
        renderScene();
    }
    const beamWidth = 54 + clamp(Math.hypot(x, y), 0, 1) * 72;
    sceneBeam.style.width = `${beamWidth}px`;
    sceneBeam.style.transform = `translate(${x * 18}px, ${y * -12}px) rotate(${x * 28}deg)`;
    characterRoot.style.transform = `translate(${x * 12}px, ${y * -8}px)`;
});
menuDriver.addEventListener("tilt-to-edit:commit", (event) => {
    const detail = event;
    if (typeof detail.detail.selectedIndex !== "number") {
        return;
    }
    backdropIndex = clamp(detail.detail.selectedIndex, 0, BACKDROPS.length - 1);
    renderScene();
});
renderScene();
export {};
