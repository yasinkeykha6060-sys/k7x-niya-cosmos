"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Digits = "fa" | "en";
export type Quality = "auto" | "low" | "medium" | "high";

type Prefs = {
  digits: Digits;
  quality: Quality;
  setDigits: (value: Digits) => void;
  setQuality: (value: Quality) => void;
};

const Ctx = createContext<Prefs>({
  digits: "fa",
  quality: "auto",
  setDigits: () => undefined,
  setQuality: () => undefined,
});

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [digits, setDigitsState] = useState<Digits>("fa");
  const [quality, setQualityState] = useState<Quality>("auto");
  useEffect(() => {
    const d = localStorage.getItem("ny-digits");
    const q = localStorage.getItem("ny-quality");
    if (d === "fa" || d === "en") setDigitsState(d);
    if (q === "auto" || q === "low" || q === "medium" || q === "high") setQualityState(q);
  }, []);
  const setDigits = (value: Digits) => {
    setDigitsState(value);
    localStorage.setItem("ny-digits", value);
  };
  const setQuality = (value: Quality) => {
    setQualityState(value);
    localStorage.setItem("ny-quality", value);
  };
  return <Ctx.Provider value={{ digits, quality, setDigits, setQuality }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  return useContext(Ctx);
}
