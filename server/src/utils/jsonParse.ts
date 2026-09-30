export function parseJsonLoose<T>(text: string): T | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
    if (fence?.[1]) {
      try {
        return JSON.parse(fence[1].trim()) as T;
      } catch {
        return null;
      }
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
