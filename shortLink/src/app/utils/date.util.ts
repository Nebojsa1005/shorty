export function getLast7Weekdays(): string[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(days[date.getDay()]);
  }

  return result;
}

export function getLast30Weekdays(): string[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: string[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(days[date.getDay()]);
  }

  return result;
}

export function getLast30Days(): string[] {
  const result: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(date.toISOString().split('T')[0]); // 'YYYY-MM-DD'
  }
  return result;
}

export function get1Month() {
  return (365.25 / 12) * 24 * 60 * 60 * 1000;
}

export function get1MonthAgo() {
  return new Date().getTime() - get1Month()
}

export function get6MonthsAgo() {
  return new Date().getTime() - get1Month() * 6
}

export function get12MonthsAgo() {
  return new Date().getTime() - get1Month() * 12
}
