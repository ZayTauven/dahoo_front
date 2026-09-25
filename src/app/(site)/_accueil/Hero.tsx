"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { Container } from "@/components/site/layout";
import { EASE_OUT } from "@/components/site/motion";
import { PHOTOS, type SitePhoto } from "@/components/site/photos";

/**
 * Mosaïque du hero (reprise du « Zoom Parallax » de 21st) : 7 photos disposées autour du centre de
 * l'écran. Chaque tuile grossit à sa propre vitesse pendant le défilement ; la photo centrale finit
 * par remplir l'écran. Positions et tailles d'origine, en unités d'écran (vw / vh) ; sur mobile
 * (écran étroit et haut), des tuiles plus larges pour garder des photos lisibles.
 */
type Box = { top: string; left: string; width: string; height: string };
const TILES: { photo: SitePhoto; box: Box; mobile: Box; sizes: string }[] = [
  { photo: PHOTOS.villaPatioBleu, box: { top: "0", left: "0", width: "25vw", height: "25vh" }, mobile: { top: "0", left: "0", width: "46vw", height: "24vh" }, sizes: "100vw" },
  { photo: PHOTOS.goreePort, box: { top: "-30vh", left: "5vw", width: "35vw", height: "30vh" }, mobile: { top: "-29vh", left: "8vw", width: "58vw", height: "22vh" }, sizes: "60vw" },
  { photo: PHOTOS.cornicheResidences, box: { top: "-10vh", left: "-25vw", width: "20vw", height: "45vh" }, mobile: { top: "-8vh", left: "-36vw", width: "30vw", height: "36vh" }, sizes: "40vw" },
  { photo: PHOTOS.interieur07, box: { top: "0", left: "27.5vw", width: "25vw", height: "25vh" }, mobile: { top: "2vh", left: "38vw", width: "30vw", height: "22vh" }, sizes: "45vw" },
  { photo: PHOTOS.saintLouisPirogues, box: { top: "27.5vh", left: "5vw", width: "20vw", height: "25vh" }, mobile: { top: "27vh", left: "10vw", width: "38vw", height: "20vh" }, sizes: "40vw" },
  { photo: PHOTOS.salyAerienVillas, box: { top: "27.5vh", left: "-22.5vw", width: "30vw", height: "25vh" }, mobile: { top: "26vh", left: "-32vw", width: "42vw", height: "19vh" }, sizes: "50vw" },
  { photo: PHOTOS.interieur02, box: { top: "22.5vh", left: "25vw", width: "15vw", height: "15vh" }, mobile: { top: "22vh", left: "42vw", width: "26vw", height: "14vh" }, sizes: "30vw" },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Vitesse de grossissement de chaque tuile (même suite que le composant d'origine). */
const SCALE_ENDS = [4, 5, 6, 5, 6, 8, 9];

function Tile({
  tile,
  index,
  scale,
  still,
}: {
  tile: (typeof TILES)[number];
  index: number;
  scale: MotionValue<number>;
  still: boolean;
}) {
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center" style={still ? undefined : { scale }}>
      <motion.div
        className="relative top-(--t) left-(--l) h-(--h) w-(--w) overflow-hidden sm:top-(--st) sm:left-(--sl) sm:h-(--sh) sm:w-(--sw)"
        style={
          {
            "--t": tile.mobile.top,
            "--l": tile.mobile.left,
            "--w": tile.mobile.width,
            "--h": tile.mobile.height,
            "--st": tile.box.top,
            "--sl": tile.box.left,
            "--sw": tile.box.width,
            "--sh": tile.box.height,
          } as CSSProperties
        }
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.15 + index * 0.08, ease: EASE_OUT }}
      >
        <Image
          src={tile.photo.src}
          alt=""
          fill
          preload={index === 0}
          sizes={tile.sizes}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Hero de l'accueil, pensé comme le moment fort du site : on arrive sur une mosaïque de vraies photos
 * du Sénégal (biens, villes, intérieurs) sous le grand titre ; au défilement, la villa centrale grandit
 * jusqu'à remplir l'écran pendant que le titre s'efface et qu'un second message apparaît.
 * La recherche reste en bas de l'écran pendant toute la séquence.
 * « Réduire les animations » : mosaïque fixe sur un seul écran.
 */
export function Hero({
  labelledBy,
  title,
  figures,
  children,
}: {
  labelledBy: string;
  /** Contenu du <h1> (et son sur-titre). */
  title: ReactNode;
  /** Chiffres réels affichés au-dessus de la recherche. */
  figures?: string;
  /** Recherche. */
  children: ReactNode;
}) {
  const container = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });

  const scale4 = useTransform(scrollYProgress, (v) => 1 + (SCALE_ENDS[0] - 1) * v);
  const scale5 = useTransform(scrollYProgress, (v) => 1 + (SCALE_ENDS[1] - 1) * v);
  const scale6 = useTransform(scrollYProgress, (v) => 1 + (SCALE_ENDS[2] - 1) * v);
  const scale8 = useTransform(scrollYProgress, (v) => 1 + (SCALE_ENDS[5] - 1) * v);
  const scale9 = useTransform(scrollYProgress, (v) => 1 + (SCALE_ENDS[6] - 1) * v);
  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  // Transformations en fonction (et non en plages) : Motion délègue sinon l'opacité au moteur natif
  // des animations liées au défilement, qui calcule ici une progression fausse (vérifié dans Chrome).
  const titleOpacity = useTransform(scrollYProgress, (v) => 1 - clamp(v / 0.3));
  const titleY = useTransform(scrollYProgress, (v) => `${-18 * clamp(v / 0.3)}%`);
  const veil = useTransform(scrollYProgress, (v) => (v < 0.5 ? 0.5 - 0.4 * v : 0.3 + 0.24 * (v - 0.5)));
  const outroOpacity = useTransform(scrollYProgress, (v) => clamp((v - 0.62) / 0.23));
  const outroY = useTransform(scrollYProgress, (v) => 40 * (1 - clamp((v - 0.62) / 0.23)));

  return (
    <section
      ref={container}
      aria-labelledby={labelledBy}
      className={reduceMotion ? "relative h-svh bg-brand-900" : "relative h-[260vh] bg-brand-900"}
    >
      <div className="sticky top-0 h-svh overflow-hidden text-white">
        <div aria-hidden="true" className="absolute inset-0">
          {TILES.map((tile, index) => (
            <Tile key={tile.photo.src} tile={tile} index={index} scale={scales[index]} still={reduceMotion} />
          ))}
        </div>

        {/* Voile : garantit la lecture du texte blanc (AA) sur toutes les photos. */}
        <motion.div
          aria-hidden="true"
          className="bg-brand-900 pointer-events-none absolute inset-0"
          style={{ opacity: reduceMotion ? 0.5 : veil }}
        />
        <div
          aria-hidden="true"
          className="from-brand-900/85 pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t to-transparent"
        />

        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 pb-40 sm:pb-32"
          style={reduceMotion ? undefined : { opacity: titleOpacity, y: titleY }}
        >
          <div className="flex max-w-6xl flex-col items-center gap-6 text-center">{title}</div>
        </motion.div>

        {!reduceMotion && (
          <motion.p
            aria-hidden="true"
            className="font-display pointer-events-none absolute inset-x-0 top-[30%] m-0 px-6 text-center text-4xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={{ opacity: outroOpacity, y: outroY }}
          >
            Des biens réels, publiés par <em className="italic">les agences qui les gèrent.</em>
          </motion.p>
        )}

        <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-10">
          <Container className="flex flex-col items-center gap-4">
            {figures && <p className="site-label m-0 text-center text-white/75">{figures}</p>}
            <motion.div
              className="w-full max-w-5xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: EASE_OUT }}
            >
              {children}
            </motion.div>
          </Container>
        </div>
      </div>
    </section>
  );
}
