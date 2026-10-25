const SHOWCASE_PILLS = [
  "INTERFACE",
  "ANIMATION",
  "TECHNIQUES",
] as const;

export function Showcase() {
  return (
    <>
      <div className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          {SHOWCASE_PILLS.map((pill, index) => (
            <div
              key={pill}
              className={`-rotate-6 bg-white text-black rounded-full px-12 py-2 md:py-4 text-7xl md:text-9xl font-bold uppercase tracking-tighter w-max border-[3px] border-black leading-none ${
                index === 0 ? "" : "-mt-6 md:-mt-14"
              }`}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center p-10">
        <p className="text-white text-center text-lg md:text-2xl max-w-3xl leading-relaxed">
          Every interface animation draws from the same repertoire of techniques
          to make sites and apps more engaging. Many of these have their roots in
          the golden age of hand-drawn cartoons — but have been adapted for the
          digital era.
        </p>
      </div>
    </>
  );
}
