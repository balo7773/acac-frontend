'use client';
import { useEffect, useState } from 'react';

export function useTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  useEffect(() => {
    fetch('/api/time')
      .then(r => r.json())
      .then(({ epoch }) => setOffsetMs(epoch * 1000 - Date.now()))
      .catch(() => {});
  }, []);
  const now = () => new Date(Date.now() + offsetMs);
  return { now, offsetMs };
}

export function useCountdown(targetIso: string | null, offsetMs: number) {
  const compute = () => {
    if (!targetIso) return { ms: 0, expired: true };
    const remaining = new Date(targetIso).getTime() - (Date.now() + offsetMs);
    return { ms: Math.max(0, remaining), expired: remaining <= 0 };
  };
  const [state, setState] = useState(compute);
  useEffect(() => {
    if (!targetIso) return;
    setState(compute());
    const id = setInterval(() => setState(compute()), 1000);
    return () => clearInterval(id);
  }, [targetIso, offsetMs]);
  return state;
}

export function formatMMSS(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
