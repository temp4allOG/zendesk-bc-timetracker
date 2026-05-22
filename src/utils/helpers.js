export function clampDescription(text,ticketUrl){const suffix=` - ${ticketUrl}`;const max=250-suffix.length;return `${String(text||'').slice(0,Math.max(0,max)).trim()}${suffix}`.slice(0,250)}
export function todayISO(){return new Date().toISOString().slice(0,10)}
export function formatOption(number,name){return [number,name].filter(Boolean).join(' - ')}
export function isPositiveHours(v){const n=Number(v);return Number.isFinite(n)&&n>0&&n<=24}
