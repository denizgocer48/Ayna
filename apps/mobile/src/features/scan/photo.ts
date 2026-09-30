import { METRIC_META, type CaptureQuality, type MetricKey } from '@ayna/shared';
import { Directory, File, Paths } from 'expo-file-system';

/**
 * Where a scan's photograph lives.
 *
 * On the device, inside the app's own document directory, and nowhere else. The
 * image is never uploaded — only the derived measurements are — so this is the
 * only copy that exists, and deleting a scan deletes it in the same action.
 * See docs/compliance.md.
 */
const SCANS_DIRECTORY = 'scans';

export function scanPhotoFile(scanId: string): File {
  return new File(Paths.document, SCANS_DIRECTORY, `${scanId}.jpg`);
}

/** The photo for a scan, or null when there is none kept. */
export function scanPhotoUri(scanId: string): string | null {
  try {
    const file = scanPhotoFile(scanId);
    return file.exists ? file.uri : null;
  } catch {
    // A missing directory is not an error worth surfacing: it simply means no
    // photo was kept for this scan.
    return null;
  }
}

export function ensureScansDirectory(): void {
  const directory = new Directory(Paths.document, SCANS_DIRECTORY);
  if (!directory.exists) directory.create({ intermediates: true });
}

/**
 * Measurements stored beside a scan's photo.
 *
 * TODO(faz-2): read these from the server, which is where the record belongs.
 * Until then this is how a build without a camera shows real output for a real
 * photograph rather than a synthetic face sitting under someone's actual face —
 * a juxtaposition that reads as a measurement of them and is not one.
 */
export type StoredMeasurement = { key: string; value: number; unit: string };

type LocalScan = {
  capturedAt: string;
  capture: { pose: 'front'; quality: CaptureQuality };
  measurements: StoredMeasurement[];
};

/**
 * Save a completed scan in app-private storage. The photograph and landmarks
 * never cross the network boundary; only the derived scalar measurements are
 * written beside the local photo.
 */
export async function saveLocalScan(
  temporaryPhotoPath: string,
  quality: CaptureQuality,
  values: Partial<Record<MetricKey, number>>,
): Promise<string> {
  ensureScansDirectory();

  const scanId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const photo = scanPhotoFile(scanId);
  const metadata = new File(Paths.document, SCANS_DIRECTORY, `${scanId}.json`);
  const measurements = (Object.entries(values) as [MetricKey, number][]).map(([key, value]) => ({
    key,
    value,
    unit: METRIC_META[key].unit,
  }));
  const record: LocalScan = {
    capturedAt: new Date().toISOString(),
    capture: { pose: 'front', quality },
    measurements,
  };

  try {
    await new File(temporaryPhotoPath).copy(photo);
    metadata.write(JSON.stringify(record));
    return scanId;
  } catch (error) {
    if (photo.exists) photo.delete();
    if (metadata.exists) metadata.delete();
    throw error;
  }
}

export async function scanMeasurements(scanId: string): Promise<StoredMeasurement[] | null> {
  try {
    const file = new File(Paths.document, SCANS_DIRECTORY, `${scanId}.json`);
    if (!file.exists) return null;

    const parsed = JSON.parse(await file.text()) as { measurements?: StoredMeasurement[] };
    return parsed.measurements ?? null;
  } catch {
    return null;
  }
}

/** Remove a scan's photo. Called when the scan itself is deleted. */
export function deleteScanPhoto(scanId: string): void {
  try {
    const file = scanPhotoFile(scanId);
    if (file.exists) file.delete();
  } catch {
    // Already gone is the outcome we wanted.
  }
}
