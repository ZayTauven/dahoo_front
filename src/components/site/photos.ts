/**
 * Photothèque du site public : photos réelles fournies par Dahoo (Sénégal, biens gérés),
 * converties en WebP dans public/images/site/dahoo. Toujours passer par ce fichier pour avoir
 * le texte alternatif et les dimensions (next/image).
 */
export interface SitePhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const PHOTOS = {
  cornicheResidences: { src: "/images/site/dahoo/corniche-residences.webp", alt: "Résidences sur la corniche, face à la mer", width: 1800, height: 2400 },
  dakarAerienCites: { src: "/images/site/dahoo/dakar-aerien-cites.webp", alt: "Cités résidentielles de Dakar vues du ciel", width: 1800, height: 2400 },
  dakarCathedraleCarRapide: { src: "/images/site/dahoo/dakar-cathedrale-car-rapide.webp", alt: "Rue de Dakar avec un car rapide devant la cathédrale", width: 2400, height: 1600 },
  dakarRueMosquee: { src: "/images/site/dahoo/dakar-rue-mosquee.webp", alt: "Rue animée de Dakar devant une mosquée", width: 2400, height: 1600 },
  dakarVueAerienne: { src: "/images/site/dahoo/dakar-vue-aerienne.webp", alt: "Quartier de Dakar vu du ciel, avec un terrain de sport", width: 1350, height: 2400 },
  goreePort: { src: "/images/site/dahoo/goree-port.webp", alt: "Port de l'île de Gorée et ses maisons colorées", width: 2400, height: 1600 },
  immeublePalmiers: { src: "/images/site/dahoo/immeuble-palmiers.webp", alt: "Immeuble blanc bordé de palmiers", width: 1800, height: 2400 },
  immeublePlateau: { src: "/images/site/dahoo/immeuble-plateau.webp", alt: "Immeuble de bureaux du Plateau, à Dakar", width: 1352, height: 2400 },
  interieur01: { src: "/images/site/dahoo/interieur-01.webp", alt: "Séjour lumineux ouvert sur une terrasse", width: 2000, height: 1333 },
  interieur02: { src: "/images/site/dahoo/interieur-02.webp", alt: "Salon aux tentures colorées et tapis", width: 2000, height: 1333 },
  interieur03: { src: "/images/site/dahoo/interieur-03.webp", alt: "Salon blanc aux sols de marbre", width: 2000, height: 1362 },
  interieur04: { src: "/images/site/dahoo/interieur-04.webp", alt: "Salon aux voilages dorés, vue sur la ville", width: 2000, height: 1500 },
  interieur05: { src: "/images/site/dahoo/interieur-05.webp", alt: "Salon boisé baigné de soleil", width: 2000, height: 1331 },
  interieur06: { src: "/images/site/dahoo/interieur-06.webp", alt: "Séjour clair avec canapé gris", width: 2000, height: 1333 },
  interieur07: { src: "/images/site/dahoo/interieur-07.webp", alt: "Séjour aux boiseries claires ouvert sur la ville", width: 2000, height: 1422 },
  interieur08: { src: "/images/site/dahoo/interieur-08.webp", alt: "Grand salon aux baies vitrées", width: 2000, height: 1335 },
  interieur09: { src: "/images/site/dahoo/interieur-09.webp", alt: "Chambre aux tons crème", width: 2000, height: 1333 },
  interieur10: { src: "/images/site/dahoo/interieur-10.webp", alt: "Séjour moderne aux boiseries", width: 2000, height: 1335 },
  interieur11: { src: "/images/site/dahoo/interieur-11.webp", alt: "Salon blanc avec tapis graphique", width: 2000, height: 1335 },
  interieur12: { src: "/images/site/dahoo/interieur-12.webp", alt: "Chambre avec tête de lit en cuir", width: 2000, height: 1333 },
  interieur13: { src: "/images/site/dahoo/interieur-13.webp", alt: "Grand salon lumineux avec tapis", width: 2000, height: 1335 },
  interieur14: { src: "/images/site/dahoo/interieur-14.webp", alt: "Cuisine ouverte et salle à manger", width: 2000, height: 1335 },
  interieur15: { src: "/images/site/dahoo/interieur-15.webp", alt: "Cuisine ouverte et coin repas", width: 2000, height: 1335 },
  interieur16: { src: "/images/site/dahoo/interieur-16.webp", alt: "Cuisine blanche et séjour", width: 2000, height: 1355 },
  interieur17: { src: "/images/site/dahoo/interieur-17.webp", alt: "Cuisine équipée et coin repas", width: 2000, height: 1333 },
  interieur18: { src: "/images/site/dahoo/interieur-18.webp", alt: "Salon avec lampadaire et tapis graphique", width: 2000, height: 1335 },
  interieur19: { src: "/images/site/dahoo/interieur-19.webp", alt: "Salon blanc avec plantes", width: 2000, height: 1331 },
  interieur20: { src: "/images/site/dahoo/interieur-20.webp", alt: "Séjour et coin repas en marbre blanc", width: 2000, height: 1328 },
  interieur21: { src: "/images/site/dahoo/interieur-21.webp", alt: "Couloir et séjour en enfilade", width: 2000, height: 1335 },
  interieur22: { src: "/images/site/dahoo/interieur-22.webp", alt: "Salle à manger ouverte sur le jardin", width: 2000, height: 1335 },
  interieur23: { src: "/images/site/dahoo/interieur-23.webp", alt: "Séjour en duplex avec escalier", width: 2000, height: 1305 },
  plageDakar: { src: "/images/site/dahoo/plage-dakar.webp", alt: "Plage de Dakar au pied des immeubles", width: 2400, height: 1600 },
  residenceBriques: { src: "/images/site/dahoo/residence-briques.webp", alt: "Résidence de briques entourée de jardins", width: 2400, height: 1800 },
  residenceFacadeOcre: { src: "/images/site/dahoo/residence-facade-ocre.webp", alt: "Résidence aux façades ocre et balcons filants", width: 2400, height: 1600 },
  saintLouisPirogues: { src: "/images/site/dahoo/saint-louis-pirogues.webp", alt: "Pirogues sur le fleuve à Saint-Louis", width: 2400, height: 1600 },
  salyAerienVillas: { src: "/images/site/dahoo/saly-aerien-villas.webp", alt: "Villas de Saly vues du ciel, entre les palmiers", width: 2400, height: 1800 },
  tourVueMer: { src: "/images/site/dahoo/tour-vue-mer.webp", alt: "Tour de logements face à l'océan", width: 1607, height: 2400 },
  toursDakar: { src: "/images/site/dahoo/tours-dakar.webp", alt: "Tours de logements à Dakar", width: 1350, height: 2400 },
  villaBlancheBalcons: { src: "/images/site/dahoo/villa-blanche-balcons.webp", alt: "Villa blanche aux balcons vitrés", width: 1600, height: 2400 },
  villaContemporaine: { src: "/images/site/dahoo/villa-contemporaine.webp", alt: "Villa contemporaine sur deux niveaux", width: 2400, height: 1800 },
  villaPatioBleu: { src: "/images/site/dahoo/villa-patio-bleu.webp", alt: "Villa blanche à arcades autour d'un patio et d'une piscine", width: 2400, height: 1600 },
  villaPatioPiscine: { src: "/images/site/dahoo/villa-patio-piscine.webp", alt: "Villa aux baies noires ouvrant sur une piscine", width: 1600, height: 2400 },
  villaPiscineJardin: { src: "/images/site/dahoo/villa-piscine-jardin.webp", alt: "Villa contemporaine avec piscine et jardin", width: 2400, height: 1602 },
  villasBlanches: { src: "/images/site/dahoo/villas-blanches.webp", alt: "Villas blanches sous un ciel bleu", width: 1800, height: 2400 },
} satisfies Record<string, SitePhoto>;

export type PhotoKey = keyof typeof PHOTOS;

/** Intérieurs, dans l'ordre (galeries, mosaïques). */
export const INTERIORS: SitePhoto[] = Object.entries(PHOTOS)
  .filter(([key]) => key.startsWith("interieur"))
  .map(([, photo]) => photo);
