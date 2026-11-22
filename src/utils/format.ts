const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' });

/** "22 Nov 2026, 11:40" in the user's locale and time zone. */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** "11:40:05" — used for "Last updated" labels. */
export function formatTime(date: Date): string {
  return timeFormat.format(date);
}
