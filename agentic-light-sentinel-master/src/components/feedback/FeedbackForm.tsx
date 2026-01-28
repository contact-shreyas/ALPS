"use client";
import { useState } from "react";

export function FeedbackForm({ code }: { code: string }) {
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await fetch("/api/learn", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code, note, rating })
          });
          setNote("");
          setRating(5);
          alert("Thanks for the feedback!");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="text-xs text-neutral-500">Feedback for <b>{code}</b></div>
      <textarea
        className="w-full border rounded p-2 text-sm"
        placeholder="What are you seeing on ground?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
      />
      <div className="flex items-center gap-2">
        <label className="text-sm">Rating</label>
        <input
          type="number"
          min={1} max={5}
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="w-16 border rounded p-1 text-sm"
        />
        <button
          disabled={busy}
          className="ml-auto px-3 py-1 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
