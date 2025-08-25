import { CaseRecord } from "./types";
import { STORAGE_KEY_V2 } from "./constants";

export function estimateBytes(str: string) {
  return str.length * 2; // UTF-16-ish
}

function isQuotaError(err: unknown) {
  const e = err as any;
  const name = e?.name || "";
  const msg = e?.message || "";
  return name.includes("QuotaExceeded") || msg.includes("exceeded the quota") || msg.includes("quota");
}

export function persistHistorySafely(history: CaseRecord[], setNotice?: (s: string) => void) {
  try {
    const payload = JSON.stringify(history);
    localStorage.setItem(STORAGE_KEY_V2, payload);
    return;
  } catch (err) {
    if (!isQuotaError(err)) throw err;
  }

  // On quota overflow: progressively shrink
  let working = [...history];

  // 1) Strip thumbnails from the OLDEST half first
  for (let i = working.length - 1; i >= 0; i--) {
    if (working[i].thumbUrl) {
      working[i] = { ...working[i], thumbUrl: undefined };
    }
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(working));
      setNotice?.("Storage was full. Older thumbnails were removed.");
      return;
    } catch (e) {
      if (!isQuotaError(e)) throw e;
    }
  }

  // 2) Drop oldest records until it fits
  while (working.length > 0) {
    working.pop();
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(working));
      setNotice?.("Storage was full. Oldest cases were pruned.");
      return;
    } catch (e) {
      if (!isQuotaError(e)) throw e;
    }
  }

  // 3) If we still can't store, clear entirely but warn the user
  localStorage.removeItem(STORAGE_KEY_V2);
  setNotice?.("Storage was completely full. History could not be saved.");
}