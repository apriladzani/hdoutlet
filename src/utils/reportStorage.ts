import { DailyReport } from '../types.ts';

const LOCAL_STORAGE_KEY = 'hd_daily_reports_backup_v1';

/**
 * Retrieve all reports stored in localStorage
 */
export function getLocalReports(): DailyReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse local reports:', err);
    return [];
  }
}

/**
 * Persist an array of reports to localStorage
 */
export function saveLocalReports(reports: DailyReport[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Failed to save local reports to localStorage:', err);
  }
}

/**
 * Add or update a report in localStorage and return the updated array
 */
export function upsertLocalReport(report: DailyReport): DailyReport[] {
  const current = getLocalReports();
  const index = current.findIndex((r) => r.id === report.id);
  let updated: DailyReport[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = report;
  } else {
    updated = [report, ...current];
  }
  saveLocalReports(updated);
  return updated;
}

/**
 * Remove a report by id from localStorage
 */
export function removeLocalReport(id: number): DailyReport[] {
  const current = getLocalReports();
  const filtered = current.filter((r) => r.id !== id);
  saveLocalReports(filtered);
  return filtered;
}

/**
 * Merge reports from the server with any reports stored locally
 * ensuring no data is ever lost even if published/deployed to stateless environments.
 */
export function mergeReportsWithLocal(serverReports: DailyReport[]): DailyReport[] {
  const localReports = getLocalReports();
  if (localReports.length === 0) {
    if (serverReports.length > 0) {
      saveLocalReports(serverReports);
    }
    return serverReports;
  }

  // Create map from server reports
  const map = new Map<number, DailyReport>();
  serverReports.forEach((r) => map.set(r.id, r));

  // Keep any local reports that may not have reached the server yet
  localReports.forEach((lr) => {
    if (!map.has(lr.id)) {
      map.set(lr.id, lr);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    // Sort descending by report_date then id
    if (a.report_date !== b.report_date) {
      return b.report_date.localeCompare(a.report_date);
    }
    return b.id - a.id;
  });

  saveLocalReports(merged);
  return merged;
}
