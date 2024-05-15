export function classNames(...classes) { return classes.filter(Boolean).join(' '); }
export const DATE_OPT_MDY4 = { month: 'numeric', day: 'numeric', year: 'numeric' };
export const DATE_OPT_MDY2 = { month: 'numeric', day: 'numeric', year: '2-digit' };
export const DATE_OPT_MD = { month: 'numeric', day: 'numeric' };
export const DATE_OPT_DAY_LONG = { weekday: 'long' };
export const DATE_OPT_MONTH_LONG = { month: 'long' };
export const HEADER_MONTHS = [
  { nam: 'Jan', name: 'January', number: 1 },
  { nam: 'Feb', name: 'February', number: 2 },
  { nam: 'Mar', name: 'March', number: 3 },
  { nam: 'Apr', name: 'April', number: 4 },
  { nam: 'May', name: 'May', number: 5 },
  { nam: 'Jun', name: 'June', number: 6 },
  { nam: 'Jul', name: 'July', number: 7 },
  { nam: 'Aug', name: 'August', number: 8 },
  { nam: 'Sep', name: 'September', number: 9 },
  { nam: 'Oct', name: 'October', number: 10 },
  { nam: 'Nov', name: 'November', number: 11 },
  { nam: 'Dec', name: 'December', number: 12 }
];
export const DAYS_31 = Array.from({ length: 31 }, (_, i) => i + 1);
export const Q_MAP = [
  {q1: 'O', q: 'BOT', bg: 'bg-pink-300'},
  {q1: 'G', q: 'GRN', bg: 'bg-green-400'},
  {q1: 'B', q: 'BRN', bg: 'bg-amber-600'},
  {q1: '4', q: 'Q4', bg: 'bg-yellow-500'},
  {q1: '5', q: 'Q5', bg: 'bg-yellow-400'},
  {q1: 'Q', q: 'Q6+', bg: 'bg-yellow-300'},
  {q1: 'F', q: 'FRG', bg: 'bg-red-500'},
  {q1: 'D', q: 'DBL', bg: 'bg-blue-600'},
];
export const MAGIC_INTERVAL = [
  { min: 0, max: 99, text: "0 - 99"},
  { min: 100, max: 199, text: "100 - 199"},
  { min: 200, max: 299, text: "200 - 299"},
  { min: 300, max: 399, text: "300 - 399"},
  { min: 400, max: 499, text: "400 - 499"},
  { min: 500, max: 9999, text: "500 +"},
];
