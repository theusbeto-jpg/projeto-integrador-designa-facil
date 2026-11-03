export const songTitlesByNumber: Record<string,string> = Object.fromEntries(Array.from({length:160},(_,i)=>[String(i+1), "Canção fictícia "+(i+1)]));

function songMatchFromValue(value: string) {
  return (
    value.match(/Cântico\s+(\d{1,3})(?:\s*[:.-]\s*([^|\n]+))?/i) ??
    value.match(/^(\d{1,3})(?:\s*[:.-]\s*(.+))?$/)
  );
}

function cleanSongTitle(value: string | undefined) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s*(?:Comentários iniciais|Comentários finais).*$/i, "")
    .replace(/^(?:e\s+oração|oração)\b.*$/i, "")
    .trim();
}

export function formatSongDisplay(value: string | null | undefined) {
  const clean = (value ?? "").trim();
  if (!clean) return "";
  const match = songMatchFromValue(clean);
  if (!match) return clean;

  const number = String(Number(match[1]));
  const title = cleanSongTitle(match[2]) || songTitlesByNumber[number] || "";
  return title ? `${number} - ${title}` : number;
}

export function normalizeSongForStorage(value: string | null | undefined) {
  const display = formatSongDisplay(value);
  const match = display.match(/^(\d{1,3})(?:\s+-\s+(.+))?$/);
  if (!match) return "";
  return `Cântico ${Number(match[1])}${match[2] ? `: ${match[2]}` : ""}`;
}
