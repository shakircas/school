"use client";

export default function ClashWarnings({ clashes }) {
  if (!clashes.length) return null;

  return (
    <div className="bg-red-50 border border-red-300 rounded p-4">
      <h3 className="font-semibold text-red-700 mb-2">
        ⚠ Teacher Clashes Detected
      </h3>

      <ul className="space-y-1 text-sm">
        {clashes.map((c, i) => (
          <li key={i}>
            <strong>{c.teacher}</strong> →{` ${c.day} (${c.time})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
