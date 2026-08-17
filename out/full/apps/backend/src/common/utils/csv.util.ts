function csvField(value: string | number): string {
  const str = String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(header: string[], rows: (string | number)[][]): string {
  return (
    [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n') +
    '\r\n'
  );
}
