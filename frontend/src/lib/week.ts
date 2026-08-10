/**
 * Dates, in the timezone of whoever is looking.
 *
 * The server never decides what "today" or "this week" means — the iPad on the
 * wall and the phone in the shop both know their own clock, so the week is
 * computed here and passed to the API as explicit dates. That is what keeps the
 * kitchen display correct through a DST change without the server knowing where
 * the house is.
 */

/** `YYYY-MM-DD` in local time. `toISOString()` would shift the date by a day
 *  for anyone west of UTC in the evening, which is exactly when a kitchen
 *  display is being looked at. */
export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The Monday that starts the week containing `date`. */
export function mondayOf(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  // getDay() is 0 for Sunday, which belongs to the week that began six days ago.
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** The seven days of the week starting at `monday`. */
export function weekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function isSameDay(a: Date, b: Date): boolean {
  return isoDate(a) === isoDate(b);
}

const short = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const longMonth = new Intl.DateTimeFormat(undefined, { month: 'long' });
const shortMonth = new Intl.DateTimeFormat(undefined, { month: 'short' });
const fullDate = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});
const weekdayAndDate = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'long',
  day: 'numeric',
});

/** "Mon" */
export const dayShort = (date: Date) => short.format(date);
/** "10" */
export const dayNumber = (date: Date) => `${date.getDate()}`;
/** "Aug 10" */
export const monthDay = (date: Date) => `${shortMonth.format(date)} ${date.getDate()}`;
/** "Wednesday, August 12" */
export const fullDay = (date: Date) => fullDate.format(date);
/** "Thu, August 13" — the assign panel's day label. */
export const assignLabel = (date: Date) => weekdayAndDate.format(date);

/** "August 10 – 16", collapsing the month when the week doesn't cross one. */
export function weekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const startMonth = longMonth.format(monday);
  if (monday.getMonth() === sunday.getMonth()) {
    return `${startMonth} ${monday.getDate()} – ${sunday.getDate()}`;
  }
  return `${startMonth} ${monday.getDate()} – ${longMonth.format(sunday)} ${sunday.getDate()}`;
}

/** 12-hour clock without a leading zero, as the display renders it. */
export function clockTime(date: Date): string {
  const hour = date.getHours() % 12 || 12;
  return `${hour}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

export const meridiem = (date: Date) => (date.getHours() >= 12 ? 'PM' : 'AM');

/** "7:40 AM" — used for event rows. */
export function eventTime(date: Date): string {
  return `${clockTime(date)} ${meridiem(date)}`;
}

export function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "3 things on today" / "nothing on today" — the Home subtitle's tail. */
export function thingsOnToday(count: number): string {
  if (count === 0) return 'nothing on today';
  return `${count} thing${count === 1 ? '' : 's'} on today`;
}
