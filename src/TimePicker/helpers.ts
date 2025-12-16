import { TimeConfig } from "./types";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const parseTime = (timeStr?: string) => {
  if (!timeStr) {
    const now = new Date();
    return { h: now.getHours(), m: now.getMinutes() };
  }
  const [h, m] = timeStr.split(':').map(Number);
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
};

const formatTimeDisplay = (h: number, m: number, is12h: boolean) => {
  if (!is12h) return `${pad(h)}:${pad(m)}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${pad(hour12)}:${pad(m)} ${period}`;
};

const getMinutesFromMidnight = (h: number, m: number) => h * 60 + m;

const roundToInterval = (value: number, interval: number) => {
  return Math.round(value / interval) * interval;
};

// --- RESOLVE DYNAMIC TIME PROPS ---
const resolveTimeProp = (prop: string | TimeConfig | undefined, interval: number): string | undefined => {
  if (!prop) return undefined;
  if (typeof prop === 'string') return prop;

  if (prop.type === 'now') {
    const now = new Date();
    if (prop.offsetMinutes) now.setMinutes(now.getMinutes() + prop.offsetMinutes);

    let h = now.getHours();
    let m = now.getMinutes();

    if (prop.roundUp) {
      const remainder = m % interval;
      if (remainder !== 0) {
        m = m + (interval - remainder);
        if (m >= 60) {
          m = 0;
          h = (h + 1) % 24; 
        }
      }
    }
    return `${pad(h)}:${pad(m)}`;
  }
  return undefined;
};

export { parseTime, formatTimeDisplay, getMinutesFromMidnight, roundToInterval, resolveTimeProp, pad }