"use client";

type Props = {
  onEnter: () => void;
  disabled?: boolean;
};

export function GamingSetup({ onEnter, disabled }: Props) {
  return (
    <div className="arcade-desk">
      <div className="arcade-desk-glow" aria-hidden="true" />
      <div className="arcade-scene">
        <div className="arcade-pc" aria-hidden="true">
          <span className="arcade-pc-window">
            <span className="arcade-fan arcade-fan-a" />
            <span className="arcade-fan arcade-fan-b" />
            <span className="arcade-gpu" />
          </span>
          <span className="arcade-pc-strip" />
        </div>

        <div className="arcade-monitor">
          <div className="arcade-bezel">
            <div className="arcade-screen">
              <div className="arcade-wallpaper" aria-hidden="true" />
              <div className="arcade-scanlines" aria-hidden="true" />
              <div className="arcade-screen-ui">
                <p className="arcade-screen-kicker">Dev Arcade</p>
                <p className="arcade-screen-copy">A private rig. Four browser games behind the glass.</p>
                <button
                  type="button"
                  className="arcade-enter"
                  onClick={onEnter}
                  disabled={disabled}
                >
                  Enter the Arcade
                </button>
              </div>
            </div>
          </div>
          <div className="arcade-stand" aria-hidden="true" />
        </div>
      </div>

      <div className="arcade-peripherals" aria-hidden="true">
        <div className="arcade-keyboard">
          {Array.from({ length: 42 }, (_, index) => (
            <span key={index} className="arcade-key" style={{ animationDelay: `${(index % 14) * 80}ms` }} />
          ))}
        </div>
        <div className="arcade-mouse" />
      </div>
    </div>
  );
}
