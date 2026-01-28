import { NextResponse } from "next/server";

let lastSense: string | undefined;
let lastReason: string | undefined;
let lastAct: string | undefined;
let lastLearn: string | undefined;
let queueDepth = 0;

export function GET() {
  return NextResponse.json({ lastSense, lastReason, lastAct, lastLearn, queueDepth });
}

// Export shared state for other routes to update
export const loopState = {
  get: () => ({ lastSense, lastReason, lastAct, lastLearn, queueDepth }),
  setSense: (iso: string) => (lastSense = iso),
  setReason: (iso: string) => (lastReason = iso),
  setAct: (iso: string) => (lastAct = iso),
  setLearn: (iso: string) => (lastLearn = iso),
  incQueue: () => (queueDepth++),
  decQueue: () => (queueDepth = Math.max(0, queueDepth - 1)),
};
