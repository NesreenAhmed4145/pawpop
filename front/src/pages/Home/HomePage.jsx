import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Clock,
  Heart,
  Home,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Stethoscope,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import kittenImg from "../../assets/img/pngtree-cute-kitten-plays-pink-yarn-ball-png-image_19435638.webp";
import puppyImg from "../../assets/img/hero-adopt.png";
import aboutImg from "../../assets/img/cat.jpeg";

// عدّلي الروابط دي حسب الـ routes عندك (shop / nearby / lost-found لسه مش موجودين في App.jsx)
const SERVICES = [
  { icon: Heart, title: "Adoption & Pet Matching", desc: "Meet dogs and cats waiting for a loving home, matched to fit your life.", to: "/adoption" },
  { icon: PawPrint, title: "My Pets", desc: "Keep profiles, vaccinations, vet visits and medication reminders in one place.", to: "/my-pets" },
  { icon: ShoppingBag, title: "Pet Shop", desc: "Food, treats, toys, grooming and cozy beds from trusted brands.", to: "/shop" },
  { icon: Stethoscope, title: "Find Nearby", desc: "Find vet clinics, groomers, pet shops and hotels close to you on the map.", to: "/nearby" },
  { icon: Search, title: "Lost & Found", desc: "Report a missing pet or a rescued one and reach the community fast.", to: "/lost-found" },
  { icon: Home, title: "Pet Accommodation", desc: "Book stays that truly welcome your pet, with rules you can read upfront.", to: "/accommodation" },
];

const STATS = [
  { value: "10+", label: "Years of Caring", sub: "Continuous loving service" },
  { value: "100%", label: "Certified Sitters", sub: "CPR & first aid verified" },
  { value: "24/7", label: "Vet Emergency", sub: "On-call consultations" },
];

const TESTIMONIALS = [
  { quote: "Toby came back happier than when he left. The updates and photos each day gave me real peace of mind.", name: "Sarah L. & Toby", role: "Chihuahua Parent" },
  { quote: "Booking was effortless, and Mochi got so much attention. I'll never book anywhere else for her stays.", name: "Michael R. & Mochi", role: "British Shorthair Parent" },
  { quote: "The reminders for vaccines and vet visits changed everything. Buster's health records are always up to date.", name: "Jennifer M. & Buster", role: "Pug Parent" },
];

const TRUST = ["Vet Approved", "Safe & Secure", "Verified Sitters", "Pet Friendly", "Healthy Care", "24/7 Support"];

const initials = (name) =>
  name
    .split("&")[0]
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
      <h2 className="mt-3 font-serif text-3xl font-bold text-text-heading sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-text-body sm:text-base">{subtitle}</p>}
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-page text-ink">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-surface bg-linear-to-b from-surface to-page">
        <PawPrint aria-hidden="true" className="absolute left-[18%] top-10 hidden h-7 w-7 rotate-12 text-accent/40 lg:block" />
        <PawPrint aria-hidden="true" className="absolute right-[12%] top-1/3 hidden h-6 w-6 -rotate-12 text-accent/40 lg:block" />

        <div className="mx-auto grid max-w-screen-xl grid-cols-2 items-center gap-4 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-8 lg:py-20">
          {/* النص */}
          <div className="col-span-2 text-center lg:order-2 lg:col-span-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent shadow-sm">
              <PawPrint size={12} /> Top rated pet care in town
            </span>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-text-heading sm:text-5xl lg:text-6xl">
              Best Pals for Your <span className="italic text-accent">Paw Pals</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm text-text-body sm:text-base">
              Your trusted partner in pet care. Adopt, book stays, and keep every health record of your furry companions in one place.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/accommodation"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover"
              >
                Book Now
              </Link>
              <a
                href="#services"
                className="inline-flex items-center rounded-full border border-edge bg-section px-7 py-3 text-sm font-semibold text-text-heading transition hover:bg-chip"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {["S", "M", "J"].map((l) => (
                  <span
                    key={l}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-page bg-chip text-xs font-bold text-text-title"
                  >
                    {l}
                  </span>
                ))}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-page bg-accent text-[10px] font-bold font-serif
                ">
                  2k+
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-xs font-semibold text-text-heading">
                  <Star size={13} className="fill-accent text-accent" /> 4.9/5
                </div>
                <p className="text-[11px] text-text-muted">Happy pals &amp; loving parents</p>
              </div>
            </div>
          </div>

          {/* صورة اليسار */}
          <div className="relative order-2 mx-auto w-full max-w-[220px] lg:order-1 lg:max-w-xs">
            <div className="absolute inset-x-4 bottom-0 top-8 -rotate-6 rounded-[2.5rem] bg-section" aria-hidden="true" />
            <img src={kittenImg} alt="Playful kitten" className="relative w-full object-contain drop-shadow-lg" />
          </div>

          {/* صورة اليمين */}
          <div className="relative order-3 mx-auto w-full max-w-[220px] lg:max-w-xs">
            <div className="absolute inset-x-4 bottom-0 top-8 rotate-6 rounded-[2.5rem] bg-chip" aria-hidden="true" />
            <img src={puppyImg} alt="Fluffy puppy" className="relative w-full object-contain drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section id="services" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What we offer"
            title="Our Pet Care Solutions"
            subtitle="Comprehensive, compassionate services designed around your companion's unique personality and comfort."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-2xl border border-edge bg-card p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-accent/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-section text-accent transition group-hover:bg-accent group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-text-heading">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-body">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Explore <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- About ---------------- */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border border-edge shadow-card">
              <img src={aboutImg} alt="Calm kitten resting at home" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-edge bg-card px-4 py-3 shadow-card sm:left-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-section text-accent">
                <BadgeCheck size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-text-heading">Certified Team</p>
                <p className="text-xs text-text-muted">Trained &amp; background checked</p>
              </div>
            </div>
          </div>

          <div>
            <span className="inline-block rounded-full bg-section px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
              Welcome to PawPop
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-text-heading sm:text-4xl">
              We are Dedicated to the Well-Being of Your Beloved Pets
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-body sm:text-base">
              Every pet has their own quirks, boundaries and joyful rhythms. Our mission is to combine veterinary-grade safety with the
              unconditional empathy of an extended family, from adoption and daily health tracking to stress-free stays where your pet
              feels at home.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-edge bg-section px-4 py-5 text-center sm:text-left">
                  <p className="font-serif text-3xl font-bold text-accent">{s.value}</p>
                  <p className="mt-1 text-sm font-semibold text-text-heading">{s.label}</p>
                  <p className="text-xs text-text-muted">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Testimonials"
            title="Real Stories from PawPop Families"
            subtitle="First-hand experiences from pet parents who found trusted peace of mind with our caregivers."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-edge bg-card p-6 shadow-card">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm italic leading-relaxed text-text-body">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-sm font-bold text-text-title">
                    {initials(t.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-text-heading">{t.name}</span>
                    <span className="block text-xs text-text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section className="border-y border-edge bg-surface py-10">
        <div className="mx-auto max-w-screen-xl px-4 text-center sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">Built on care you can trust</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {TRUST.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-4 py-2 text-xs font-semibold text-text-title shadow-sm"
              >
                <ShieldCheck size={14} className="text-accent" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative mx-auto max-w-screen-xl overflow-hidden rounded-3xl bg-accent bg-linear-to-br from-accent to-accent-hover p-8 font-serif shadow-card sm:p-12">
          <PawPrint aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-6 h-48 w-48 -rotate-12 text-white/10 sm:h-64 sm:w-64" />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              <CalendarCheck size={12} /> First visit offer
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl">Ready to Give Your Pet the Love &amp; Care They Deserve?</h2>
            <p className="mt-3 text-sm font-serif sm:text-base">
              Join thousands of delighted pet parents and start taking care of your companion the easy way.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/my-pets" : "/register"}
                className="inline-flex items-center gap-2 rounded-full bg-card px-7 py-3 text-sm font-semibold text-text-heading shadow-sm transition hover:opacity-90"
              >
                {isAuthenticated ? "Manage My Pets" : "Create Your Account"}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold font-serif transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-serif /85">
              {["Free meet & greet", "100% satisfaction guarantee", "Flexible cancellation"].map((f) => (
                <li key={f} className="inline-flex items-center gap-1.5">
                  <Check size={14} /> {f}
                </li>
              ))}
              <li className="inline-flex items-center gap-1.5">
                <Clock size={14} /> Support around the clock
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> Pet-friendly places near you
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}