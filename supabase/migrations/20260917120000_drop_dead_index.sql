-- Remove an index for a flow that no longer exists.
--
-- scans_status_idx is a partial index over 'pending' and 'processing'. Those
-- states belonged to the queued server-side analysis that measurement on the
-- device replaced: a scan is now measured before it is sent, so it arrives
-- complete and the index can never hold a row.
--
-- The states themselves stay in the enum. A scan can still fail validation at
-- the API, and keeping the vocabulary costs nothing.

drop index if exists scans_status_idx;
