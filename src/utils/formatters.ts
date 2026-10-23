export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount || 0));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `-Rp${formatted}` : `Rp${formatted}`;
}

export function formatNumberWithDots(val: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? Math.round(val) : parseInt(val.toString().replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumberFromDots(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/\D/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

export const DAY_NAMES_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatMonthYear(year: number, month: number): string {
  const monthName = MONTH_NAMES_ID[month - 1] || '';
  return `${monthName} ${year}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = DAY_NAMES_ID[d.getDay()];
  const monthName = MONTH_NAMES_ID[month - 1];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthName = MONTH_SHORT_ID[month - 1];
  return `${day} ${monthName} ${year}`;
}
