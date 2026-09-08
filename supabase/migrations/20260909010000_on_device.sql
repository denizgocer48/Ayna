-- Move analysis onto the device.
--
-- The photograph and the landmarks derived from it now never leave the phone.
-- Only the derived scalar measurements are uploaded — you cannot identify a
-- person from twenty-three ratios, where you certainly can from a face image or
-- a landmark template.
--
-- What this removes is not a feature but a liability: the storage bucket, the
-- signed-URL flow, the "delete the image after analysis" logic, and with them
-- the cross-border transfer problem documented in docs/compliance.md. There is
-- no longer anything to transfer.
--
-- Progress photographs for the before/after view stay on the device too.

drop policy if exists "users upload into their own scan folder" on storage.objects;
drop policy if exists "users read their own scan objects" on storage.objects;
drop policy if exists "users delete their own scan objects" on storage.objects;

-- The bucket row itself cannot be removed in SQL — Supabase blocks direct
-- deletion from storage tables and wants the Storage API. Revoking every policy
-- above already makes it inert: no client can read, write or list it. Delete the
-- empty bucket from the dashboard when convenient; nothing depends on it.

-- A capture is now only its pose and its quality report. The image itself is
-- never referenced because it is never sent.
alter table scan_images rename to scan_captures;
alter table scan_captures drop column image_path;
alter table scan_captures drop column image_retained;

alter policy "users read images of their own scans" on scan_captures
  rename to "users read captures of their own scans";
alter policy "users attach images to their own scans" on scan_captures
  rename to "users attach captures to their own scans";

-- Analysis finishes on the device before the scan is sent, so a scan arrives
-- complete. Nothing queues, nothing polls.
alter table scans alter column status set default 'complete';

comment on table scan_captures is
  'Pose and capture-quality report per photo. The photo itself stays on the device.';
comment on column scans.skin_coverage is
  'Unused while skin analysis is deferred. See docs/skin-analysis.md.';
