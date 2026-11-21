export function initSwipeControls(onMove) {
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  let startX = 0;
  let startY = 0;
  const minSwipeDistance = 30;

  gameContainer.addEventListener(
    "touchstart",
    (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    },
    { passive: true }
  );

  gameContainer.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      if (typeof onMove !== "function") return;

      // Determine horizontal vs vertical movement dominance
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) >= minSwipeDistance) {
          onMove(diffX > 0 ? 1 : -1, 0);
        }
      } else {
        if (Math.abs(diffY) >= minSwipeDistance) {
          onMove(0, diffY > 0 ? 1 : -1);
        }
      }
    },
    { passive: true }
  );
}