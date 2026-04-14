-- Phase 21: Open event_logs for public reading (Timeline Transparency)
-- The Truth Layer is read-only public — no user can INSERT/UPDATE/DELETE directly.

-- Allow any authenticated user to read event logs (for Case Timelines)
CREATE POLICY "Public can view event logs"
ON public.event_logs FOR SELECT
USING (true);
