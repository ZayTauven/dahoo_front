"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Check,
  CircleArrowOutUpRight,
  Globe,
  Heart,
  MapPin,
  Menu,
  Ruler,
  SlidersHorizontal,
} from "lucide-react";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const styles = {
  container: "mx-auto w-full max-w-7xl px-6 lg:px-8",
  card: "rounded-3xl border border-black/10 bg-surface-lowest shadow-subtle",
  cardMuted: "rounded-3xl border border-black/10 bg-surface-low",
  pill: "inline-flex items-center gap-2 rounded-full border border-black/10 bg-background px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-black/5 active:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
  iconBtn:
    "inline-flex items-center justify-center rounded-full border border-black/10 bg-background p-2 text-on-surface-variant transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
};

type Property = {
  id: number;
  title: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
};

const featuredProperties: Property[] = [
  {
    id: 1,
    title: "Villa contemporaine avec jardin",
    city: "Casablanca",
    price: "$640-$950",
    beds: 4,
    baths: 3,
    area: "320 m2",
    image: "/assets/landing-i1.jpg",
  },
  {
    id: 2,
    title: "Villa Pondok Tanjung",
    city: "Rabat",
    price: "$840-$950",
    beds: 3,
    baths: 2,
    area: "180 m2",
    image: "/assets/landing-i2.jpg",
  },
  {
    id: 3,
    title: "Bali Patriot Residence",
    city: "Tanger",
    price: "$840-$990",
    beds: 5,
    baths: 4,
    area: "410 m2",
    image: "/assets/landing-i3.jpg",
  },
];

const testimonials = [
  {
    quote:
      "Professional, responsive, and genuinely helpful. They made relocating feel easy-even from another state. Very Recommended for you!",
    author: "Lisa & Marcus T.",
    role: "Couple Clients",
  },
  {
    quote:
      "Professional, responsive, and genuinely helpful. They made relocating feel easy-even from another state. Very Recommended for you!",
    author: "Lisa & Marcus T.",
    role: "Couple Clients",
  },
  {
    quote:
      "Their agent was with us throughout the process, helping us negotiate updates smoothly. Highly recommended!",
    author: "Kevin Miller",
    role: "Investor",
  },
];

function Section({
  id,
  title,
  subtitle,
  actions,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20 lg:py-24">
      <div className={styles.container}>
        <header className="mb-10 flex items-end justify-between gap-6 lg:mb-12">
          <div>
            <h2 className="font-manrope text-3xl font-semibold tracking-tight lg:text-6xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-background/85 backdrop-blur-md">
        <div
          className={cx(
            styles.container,
            "flex h-16 items-center justify-between",
          )}
        >
          <Link
            href="/"
            className="font-manrope text-lg font-semibold tracking-tight"
          >
            HOOMA
          </Link>
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-2 rounded-full border border-black/10 bg-surface-lowest p-1 shadow-[0_1px_0_rgba(0,0,0,0.02)] md:flex"
          >
            <Link
              href="#home"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Home
            </Link>
            <Link
              href="#featured"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              Properties
            </Link>
            <Link
              href="#services"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition-colors hover:text-foreground"
            >
              About Us
            </Link>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              <Menu size={16} />
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Changer la langue"
              className={cx(styles.iconBtn, "hidden lg:inline-flex")}
            >
              <Globe size={16} />
            </button>
            <Link href="/dashboard" className={styles.btnPrimary}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="py-12 lg:py-16">
          <div className={styles.container}>
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.25fr]">
              <div className="pt-3">
                <h1 className="font-manrope text-5xl font-semibold leading-[1.02] tracking-tight lg:text-7xl">
                  Discover Fresh Visions of Your Ideal Perfect Home
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-surface-variant">
                  Discover hand-picked properties, expert agents, and a seamless
                  journey to your perfect place.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-3xl">
                    <Image
                      src="/assets/landing-i4.jpg"
                      alt="Villa minimaliste"
                      width={500}
                      height={560}
                      sizes="(max-width: 1024px) 100vw, 180px"
                      className="h-full min-h-44 w-full object-cover"
                    />
                  </div>
                  <div className={cx(styles.cardMuted, "p-5")}>
                    <button type="button" className={styles.btnPrimary}>
                      Contact With Me
                    </button>
                    <p className="mt-5 text-xl underline decoration-black/20 underline-offset-4">
                      supportagent@hearthaven.com
                    </p>
                    <div className="mt-10 flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-medium tracking-tight">
                          Dianne Russell
                        </p>
                        <p className="text-2xl leading-tight text-on-surface-variant">
                          Agents
                        </p>
                      </div>
                      <div className="rounded-full border border-black/10 p-3 text-on-surface-variant">
                        in
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative overflow-hidden rounded-3xl">
                  <Image
                    src="/assets/landing-splash.jpg"
                    alt="Maison contemporaine de luxe"
                    width={1200}
                    height={760}
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="h-80 w-full object-cover lg:h-[420px]"
                  />
                  <div className="absolute right-4 top-4 rounded-2xl bg-surface-lowest px-4 py-3 shadow-subtle">
                    <p className="text-sm font-medium">4.8 (10k Reviews)</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    "/assets/landing-i1.jpg",
                    "/assets/landing-i2.jpg",
                    "/assets/landing-i3.jpg",
                  ].map((src) => (
                    <div key={src} className="overflow-hidden rounded-2xl">
                      <Image
                        src={src}
                        alt="Apercu bien immobilier"
                        width={420}
                        height={220}
                        sizes="(max-width: 1024px) 33vw, 160px"
                        className="h-24 w-full object-cover lg:h-28"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-black/10 bg-surface-low p-2 text-sm text-on-surface-variant">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <button
                      type="button"
                      key={i}
                      className={`h-8 min-w-8 rounded-full px-2 ${i === 2 ? "bg-foreground text-background" : "hover:bg-black/5"}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div id="services" className={cx(styles.card, "mt-10 p-4 lg:p-5")}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-3 lg:grid-cols-4">
                  {["Looking for", "Location", "Price", "Number of rooms"].map(
                    (label) => (
                      <label key={label} className="block">
                        <span className="mb-2 block text-sm text-on-surface-variant">
                          {label}
                        </span>
                        <div className="flex h-11 items-center rounded-xl border border-black/10 bg-background px-3 text-sm text-on-surface-variant shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                          <MapPin size={14} className="mr-2" />
                          {label}
                        </div>
                      </label>
                    ),
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {["Buy", "Sell", "Rent"].map((tab, idx) => (
                    <button
                      type="button"
                      key={tab}
                      className={cx(
                        "rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
                        idx === 0
                          ? "bg-foreground text-background"
                          : "bg-surface-low text-on-surface-variant hover:bg-black/5",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                  <button type="button" className={cx(styles.btnGhost, "ml-2")}>
                    <SlidersHorizontal size={14} /> Filter
                  </button>
                  {["All", "House", "Residential", "Apartment"].map(
                    (chip, idx) => (
                      <button
                        type="button"
                        key={chip}
                        className={cx(
                          "rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
                          idx === 0
                            ? "bg-foreground text-background"
                            : "bg-surface-low text-on-surface-variant hover:bg-black/5",
                        )}
                      >
                        {chip}
                      </button>
                    ),
                  )}
                  <button
                    type="submit"
                    className={cx(
                      styles.btnPrimary,
                      "ml-auto rounded-xl px-6 py-3",
                    )}
                  >
                    Find Properties
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <Section
          id="featured"
          title="Discover Best Properties Tailored to You"
          subtitle="Explore our travel packages this month, with options for every traveler."
          actions={
            <button type="button" className={styles.btnGhost}>
              Show More <CircleArrowOutUpRight size={16} />
            </button>
          }
        >
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <aside className={cx(styles.cardMuted, "rounded-2xl p-4")}>
              <div className="mb-4 flex items-center justify-between text-sm">
                <p>256 Results</p>
                <p>Show On Map</p>
              </div>
              <p className="mb-2 text-sm font-medium">Rental Period</p>
              <div className="space-y-2 text-sm text-on-surface-variant">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked /> Long term rent
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Short term rent
                </label>
              </div>
              <p className="mb-2 mt-5 text-sm font-medium">Bedrooms</p>
              <div className="flex flex-wrap gap-2">
                {["1", "2", "3", "4", "5 and more"].map((b) => (
                  <button
                    type="button"
                    key={b}
                    className={cx(styles.pill, "px-3 py-1.5 text-xs")}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </aside>

            <div>
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <div className="overflow-hidden rounded-3xl">
                    <Image
                      src="/assets/Image-dahoo-villa (10).jpg"
                      alt="Villa principale"
                      width={1200}
                      height={680}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-52 w-full object-cover lg:h-64"
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-5xl font-semibold">$512</p>
                      <p className="text-sm text-on-surface-variant">/Month</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Ajouter aux favoris"
                      className={styles.iconBtn}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <p className="inline-flex items-center gap-1">
                      <Ruler size={14} />
                      64 m
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <BedDouble size={14} />3 beds
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <Bath size={14} />3 baths
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-surface-low px-3 py-1.5 text-xs text-on-surface-variant">
                      Agent: Maddie molina
                    </span>
                    <button type="button" className={styles.btnPrimary}>
                      Send a request <CircleArrowOutUpRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Image
                      src="/assets/Image-dahoo-villa (5).jpg"
                      alt="Thumbnail 1"
                      width={500}
                      height={320}
                      sizes="(max-width: 1024px) 50vw, 240px"
                      className="h-24 w-full rounded-2xl object-cover lg:h-28"
                    />
                    <Image
                      src="/assets/Image-dahoo-villa (6).jpg"
                      alt="Thumbnail 2"
                      width={500}
                      height={320}
                      sizes="(max-width: 1024px) 50vw, 240px"
                      className="h-24 w-full rounded-2xl object-cover lg:h-28"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src="/assets/Image-dahoo-villa (7).jpg"
                      alt="Villa Pondok Tanjung"
                      width={700}
                      height={440}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="h-44 w-full object-cover lg:h-52"
                    />
                  </div>
                  <h3 className="text-3xl font-semibold tracking-tight">
                    Villa Pondok Tanjung
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    We&apos;ve compiled answers to the most common questions
                    about buying, selling, or renting property with Hearthaven.
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="inline-flex items-center gap-2">
                        <Check size={14} /> Equipped kitchen
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredProperties.map((property, idx) => (
                  <article
                    key={property.id}
                    className={cx(
                      "overflow-hidden rounded-3xl border border-black/10 transition-transform duration-200 hover:-translate-y-0.5",
                      idx === 1 ? "bg-black text-white" : "bg-surface-lowest",
                    )}
                  >
                    <Image
                      src={property.image}
                      alt={property.title}
                      width={720}
                      height={480}
                      sizes="(max-width: 1280px) 50vw, 30vw"
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-2xl font-medium">{property.title}</h3>
                      <p
                        className={`mt-2 text-sm ${idx === 1 ? "text-white/70" : "text-on-surface-variant"}`}
                      >
                        A spacious home with three cozy bedrooms and two
                        bathrooms, ideal for family.
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span>{property.price}</span>
                        <button
                          type="button"
                          className={cx(
                            styles.btnGhost,
                            "px-3 py-1.5",
                            idx === 1 &&
                              "border-white/20 bg-white text-black hover:bg-white/90",
                          )}
                        >
                          Book Now <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="about"
          title="Discover and book Beautiful City's"
          subtitle="Some info has been automatically translated."
        >
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.75fr]">
            <div className="rounded-3xl border border-black/10 bg-surface-low p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {["Cleanliness", "Honest", "Trusted", "Luxury"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 bg-background px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((faq) => (
                  <article key={faq} className="rounded-2xl bg-background p-4">
                    <h4 className="text-4xl text-on-surface-variant">?</h4>
                    <p className="mt-3 text-4xl leading-tight">
                      Can I sell my home?
                    </p>
                    <p className="mt-3 text-sm text-on-surface-variant">
                      Absolutely. We offer listing support, home valuation.
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-black/10">
              <Image
                src="/assets/Image-dahoo-villa (2).jpg"
                alt="Sunny Meadows Estate"
                width={700}
                height={980}
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="h-full min-h-80 w-full object-cover"
              />
            </div>
          </div>
        </Section>

        <Section
          title="Discover Best Properties Tailored to You"
          subtitle="Explore our travel packages this month, with options for every traveler."
        >
          <div className="grid items-center gap-8 rounded-3xl border border-black/10 bg-surface-low p-5 lg:grid-cols-2 lg:p-8">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/assets/Image-dahoo-villa (8).jpg"
                alt="Map discovery preview"
                width={900}
                height={560}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="h-64 w-full object-cover"
              />
            </div>
            <div>
              <p className="font-manrope text-5xl font-semibold tracking-tight">
                Discover Best Properties Tailored to You
              </p>
              <p className="mt-4 text-lg text-on-surface-variant">
                Explore our travel packages this month, with options for every
                traveler.
              </p>
              <button
                type="button"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background"
              >
                Send a request <CircleArrowOutUpRight size={16} />
              </button>
            </div>
          </div>
        </Section>

        <Section id="testimonials" title="What Our Clients Say About Us">
          <div className="mb-6 grid gap-5 lg:grid-cols-[300px_1fr]">
            <div className="rounded-2xl border border-black/10 bg-surface-low p-5">
              <p className="text-sm text-on-surface-variant">Facts & Numbers</p>
              <p className="mt-16 text-8xl font-semibold">94%</p>
              <p className="mt-4 max-w-[17ch] text-4xl leading-tight text-on-surface-variant">
                of clients would recommend Hearthaven to their friends and
                family.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/assets/Image-dahoo-villa (13).jpg"
                alt="Customer story hero"
                width={1400}
                height={780}
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="h-full min-h-72 w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-0 left-0 p-6 text-white lg:p-8">
                <p className="text-sm text-white/80">Customer Story</p>
                <p className="mt-3 max-w-2xl text-4xl leading-tight">
                  "Hearthaven made my first home purchase smooth and
                  stress-free."
                </p>
                <p className="mt-3 text-2xl text-white/80">
                  Amanda Rizky, Jakarta
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item, idx) => (
              <article
                key={`${item.author}-${idx}`}
                className={`rounded-2xl p-5 ${idx === 0 ? "bg-black text-white" : "border border-black/10 bg-surface-low"}`}
              >
                <p
                  className={`text-3xl leading-tight ${idx === 0 ? "text-white" : "text-on-surface-variant"}`}
                >
                  {item.quote}
                </p>
                <div
                  className={`mt-5 pt-4 ${idx === 0 ? "border-t border-white/20" : "border-t border-black/10"}`}
                >
                  <p className="text-xl font-medium">{item.author}</p>
                  <p
                    className={`text-sm ${idx === 0 ? "text-white/75" : "text-on-surface-variant"}`}
                  >
                    {item.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <section className="pb-20">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/assets/landing-call-to-action.jpg"
                alt="Find your dream home faster"
                width={1600}
                height={800}
                sizes="100vw"
                className="h-[380px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <h2 className="font-manrope text-6xl font-semibold tracking-tight">
                  Find Your Dream Home Faster
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-white/85">
                  Explore and uncover your ideal dream home more quickly than
                  ever before, with our innovative tools and resources designed
                  to streamline your search.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                >
                  Get Started Now
                </Link>
              </div>
            </div>

            <footer className="mt-12 border-t border-black/10 pt-10">
              <div className="grid gap-8 text-sm text-on-surface-variant sm:grid-cols-2 lg:grid-cols-6">
                {[
                  ["Company", ["Home", "Properties", "About Us", "Services"]],
                  [
                    "Information",
                    [
                      "Real Estate",
                      "Properties",
                      "Terms Of Use",
                      "Luxury Properties",
                    ],
                  ],
                  ["Community", ["Forum", "Feedback", "Events", "Newsletter"]],
                  [
                    "Support",
                    ["FAQ", "Contact Us", "Sponsorship", "Social Media"],
                  ],
                  [
                    "Resources",
                    ["Blog", "Guides", "Webinars", "Press Releases"],
                  ],
                ].map(([title, items]) => (
                  <div key={String(title)}>
                    <h3 className="mb-3 text-foreground">{title}</h3>
                    <ul className="space-y-2">
                      {(items as string[]).map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex items-start gap-2 lg:justify-end">
                  {["X", "f", "in", "ig"].map((social) => (
                    <button
                      type="button"
                      key={social}
                      className="rounded-full border border-black/20 px-2.5 py-1.5 text-xs"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 text-sm text-on-surface-variant">
                <span>Privacy Policy</span>
                <span>Copyright © BuildingBlocks 2090</span>
                <span>Terms Of Use</span>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
