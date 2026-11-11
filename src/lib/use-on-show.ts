import { useEffectEvent, useLayoutEffect } from "react";

/**
 * Runs `reset` whenever the component is shown again (and once when it first
 * mounts).
 *
 * Next keeps a page it navigated away from alive but hidden, and brings it back
 * with its state when you return to it. A button that stayed "busy" because its
 * page was on its way out would come back stuck, and a typed password would
 * still be sitting in the form. Reset those here. It runs as a layout effect, so
 * the reset lands before the page is painted.
 */
export function useOnShow(reset: () => void): void {
  const onShow = useEffectEvent(reset);
  useLayoutEffect(() => {
    onShow();
  }, []);
}
