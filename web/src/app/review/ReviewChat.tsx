import { useLayoutEffect, useRef, type RefObject } from "react";
import { mountReviewDemo } from "./review-demo.js";
import reviewStyles from "./review-chat.review.css";

export type ReviewControls = Pick<ReturnType<typeof mountReviewDemo>, "send" | "openFriends">;

export function ReviewChat({ controls, onSheetChange }: {
  controls: RefObject<ReviewControls | null>;
  onSheetChange: (open: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = host.current;
    if (!element) return;
    const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    root.innerHTML = `
      <section class="app" id="reviewApp" aria-label="盘客">
        <div class="reviewBar"><div class="status-slot" id="statusSlot"></div></div>
        <div class="chat" id="chat" aria-label="盘客对话" tabindex="0"><div class="stream" id="stream"></div></div>
        <div class="footer"><nav class="quick" id="quick" aria-label="盘客快捷操作"></nav></div>
        <dialog class="sheet" id="sheet" aria-labelledby="sheetTitle">
          <div class="sheet-head" id="sheetHead"></div>
          <div class="sheet-content" id="sheetContent"></div>
          <div class="sheet-foot" id="sheetFoot" hidden></div>
        </dialog>
        <div class="toast" id="toast" hidden></div>
        <div class="live-region" id="live" role="status" aria-live="polite"></div>
      </section>`;
    const style = document.createElement("style");
    style.textContent = reviewStyles;
    root.prepend(style);
    const onboarding = new URLSearchParams(window.location.search).get("onboarding") === "1";
    const demo = mountReviewDemo(root, onSheetChange, onboarding);
    controls.current = demo;
    return () => {
      controls.current = null;
      demo.dispose();
      root.replaceChildren();
    };
  }, [controls, onSheetChange]);

  return <div ref={host} style={{ height: "100%" }} />;
}
