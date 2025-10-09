'use client';

export default function AdminImageOverrideField({ value, onChange }) {
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      Force public (override album privacy)
    </label>
  );
}