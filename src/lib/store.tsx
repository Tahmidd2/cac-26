import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { DemoState } from "./types";
import { initialState } from "./data";
const KEY = "nourish-demo-v1";
const Context = createContext<{
  state: DemoState;
  update: (fn: (s: DemoState) => DemoState) => void;
  reset: () => void;
}>(null!);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "null");
      return stored?.version === 1
        ? { ...initialState, ...stored }
        : initialState;
    } catch {
      return initialState;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* The demo remains usable when storage is unavailable. */
    }
  }, [state]);
  return (
    <Context.Provider
      value={{ state, update: setState, reset: () => setState(initialState) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  return useContext(Context);
}
