import React, { useEffect, useMemo, useState } from "react";

/**
 * New World Daily Reset Tracker
 * Countdown fixed to 3:00 AM JST daily
 * Manual reset does NOT affect timer
 */

const STORAGE_KEY = "nw_daily_tracker_checkboxes_v1";

function getNextJSTResetEpoch(now = Date.now()) {
  const JST_OFFSET_HOURS = 9;
  const msPerHour = 60 * 60 * 1000;
  const nowJST = new Date(now + JST_OFFSET_HOURS * msPerHour);
  const jstTodayAt3 = new Date(
    nowJST.getFullYear(),
    nowJST.getMonth(),
    nowJST.getDate(),
    3, 0, 0, 0
  );
  const targetJST = nowJST >= jstTodayAt3 ? new Date(jstTodayAt3.getTime() + 24 * msPerHour) : jstTodayAt3;
  return targetJST.getTime() - JST_OFFSET_HOURS * msPerHour;
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2,"0")}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`;
}

const DEFAULT_TASKS = [
  { id: "gypsum_orb", label: "Craft Gypsum Orbs" },
  { id: "faction_quests", label: "Complete Faction Dailies" },
  { id: "town_board", label: "Town Board / Bonuses" },
  { id: "chest_route", label: "Chest Route (personal cooldowns)" },
  { id: "expedition_bonus", label: "Expedition Bonus Rewards" },
];

export default function App() {
  const [checks, setChecks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [now, setNow] = useState(Date.now());
  const resetEpoch = useMemo(() => getNextJSTResetEpoch(now), [now]);
  const timeLeft = resetEpoch - now;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }, [checks]);

  const toggle = (id) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  const resetAll = () => setChecks({});

  return (
    <div style={{ fontFamily: "Cinzel, serif", color: "#eee", background: "#111", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem" }}>New World — Daily Tracker</h1>
      <p>Next reset at 3:00 JST (UTC+9)</p>
      <h2 style={{ fontSize: "3rem" }}>{formatDuration(timeLeft)}</h2>
      <button onClick={resetAll}>Reset All</button>
      <ul>
        {DEFAULT_TASKS.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={!!checks[t.id]} onChange={() => toggle(t.id)} /> {t.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
