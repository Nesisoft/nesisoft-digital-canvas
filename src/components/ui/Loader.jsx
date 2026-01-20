import { useEffect, useRef } from "react";

const Loader = () => {
  const timelineRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadAnime = async () => {
      if (!window.anime) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js";
        script.async = true;
        script.onload = () => mounted && initialize();
        document.head.appendChild(script);
      } else {
        initialize();
      }
    };

    const initialize = () => {
      if (!window.anime) return;

      const anime = window.anime;

      timelineRef.current = anime
        .timeline({ loop: true })
        .add({
          targets: ".ml-loader .line",
          opacity: [0.4, 1],
          scaleX: [0, 1],
          easing: "easeInOutExpo",
          duration: 700,
        })
        .add({
          targets: ".ml-loader .line",
          translateY: (el, i) => `${-0.6 + i * 1.2}em`,
          easing: "easeOutExpo",
          duration: 600,
        })
        .add({
          targets: ".ml-loader .letters-left",
          opacity: [0, 1],
          translateX: ["0.5em", 0],
          easing: "easeOutExpo",
          duration: 600,
          offset: "-=300",
        })
        .add({
          targets: ".ml-loader .letters-right",
          opacity: [0, 1],
          translateX: ["-0.5em", 0],
          easing: "easeOutExpo",
          duration: 600,
          offset: "-=600",
        })
        .add({
          targets: ".ml-loader .subtitle",
          opacity: [0, 1],
          translateY: ["1em", 0],
          easing: "easeOutExpo",
          duration: 800,
          offset: "-=200",
        })
        .add({
          targets: ".ml-loader",
          opacity: 0,
          easing: "easeOutExpo",
          duration: 900,
          delay: 1000,
        });
    };

    loadAnime();

    return () => {
      mounted = false;
      timelineRef.current?.pause();
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black dark:bg-slate-950">
        <div className="ml-loader text-center select-none">
          <div className="relative inline-block leading-none">
            <span className="line line1" />
            <span className="letters letters-left">Nesisoft</span>
            <span className="letters letters-right"></span>
            <span className="line line2" />
          </div>

          <div className="mt-4">
            <span className="subtitle block text-sm tracking-widest text-slate-500 dark:text-slate-400"></span>
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .ml-loader {
          font-size: 4rem;
          font-weight: 700;
          color: #AB47BC;
        }

        .dark .ml-loader {
          color: #000;
        }

        .ml-loader .line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: currentColor;
          opacity: 0;
        }

        .ml-loader .line1 {
          top: 0;
        }

        .ml-loader .line2 {
          bottom: 0;
        }

        .ml-loader .letters {
          display: inline-block;
          opacity: 0;
          padding: 0 0.15em;
        }

        .subtitle {
          opacity: 0;
        }

        @media (max-width: 768px) {
          .ml-loader {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .ml-loader {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default Loader;
