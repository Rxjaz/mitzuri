import { useState } from "react";

/**
 * TEMPORAL - maqueta de exploracion, no es la pagina publica real.
 *
 * Sirve para decidir como se ve el feed y la pagina de proyecto ANTES de
 * modelar los campos en la base. Todo el contenido es falso y las portadas
 * son gradientes, para no depender de imagenes ni de la API.
 *
 * Cuando la direccion este elegida, este archivo se borra y lo que quede
 * pasa a `HomePage` y `ProjectPage` con datos reales.
 */

type FeedSize = "hero" | "wide" | "regular" | "tall";

type LabProject = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  client: string;
  //identidad propia del proyecto: tine la ficha, la portada y la pagina
  accent: string;
  cover: string;
  size: FeedSize;
};

const PROJECTS: LabProject[] = [
  {
    slug: "casa-ardilla",
    title: "Casa Ardilla",
    tagline: "Identidad para una cafeteria de barrio",
    year: 2026,
    client: "Casa Ardilla",
    accent: "#b4552f",
    cover: "linear-gradient(135deg, #f0c9a8, #b4552f)",
    size: "hero",
  },
  {
    slug: "manifiesto-tipografico",
    title: "Manifiesto Tipografico",
    tagline: "Editorial experimental impresa a dos tintas",
    year: 2025,
    client: "Proyecto personal",
    accent: "#2f4858",
    cover: "linear-gradient(160deg, #9db4c0, #2f4858)",
    size: "wide",
  },
  {
    slug: "raiz",
    title: "Raiz",
    tagline: "Empaque para tienda de plantas",
    year: 2025,
    client: "Vivero Raiz",
    accent: "#4a6b3d",
    cover: "linear-gradient(200deg, #c5d6b0, #4a6b3d)",
    size: "regular",
  },
  {
    slug: "festival-nocturno",
    title: "Festival Nocturno",
    tagline: "Sistema visual para un ciclo de cine",
    year: 2024,
    client: "Cineteca",
    accent: "#5b3a75",
    cover: "linear-gradient(120deg, #b9a3cf, #5b3a75)",
    size: "tall",
  },
  {
    slug: "estudio-de-color",
    title: "Estudio de Color",
    tagline: "Exploracion cromatica en riso",
    year: 2024,
    client: "Proyecto personal",
    accent: "#c2185b",
    cover: "linear-gradient(45deg, #f3b4cd, #c2185b)",
    size: "regular",
  },
  {
    slug: "marea",
    title: "Marea",
    tagline: "Direccion de arte para marca de ceramica",
    year: 2023,
    client: "Marea Ceramica",
    accent: "#1f6f78",
    cover: "linear-gradient(180deg, #a5cfd4, #1f6f78)",
    size: "wide",
  },
];

const VARIANTS = [
  { id: "editorial", label: "A · Editorial" },
  { id: "indice", label: "B · Indice" },
  { id: "sangre", label: "C · Sangre completa" },
  { id: "proyecto", label: "D · Pagina de proyecto" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

const Cover = ({
  project,
  className = "",
}: {
  project: LabProject;
  className?: string;
}) => (
  <div
    className={`overflow-hidden rounded-2xl ${className}`}
    style={{ backgroundImage: project.cover }}
  />
);

const Meta = ({ project }: { project: LabProject }) => (
  <p className="mt-1 text-sm text-stone-500">
    {project.client} · {project.year}
  </p>
);

/* ------------------------------------------------------------------ */
/* A · Editorial: un destacado grande y despues un mosaico asimetrico   */
/* ------------------------------------------------------------------ */

function EditorialFeed() {
  const [featured, ...rest] = PROJECTS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <a href="#" className="group block">
        <Cover
          project={featured}
          className="aspect-[16/7] w-full transition duration-500 group-hover:scale-[1.01]"
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: featured.accent }}
            >
              Proyecto destacado
            </span>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900">
              {featured.title}
            </h2>
            <p className="mt-2 max-w-xl text-stone-600">{featured.tagline}</p>
          </div>
          <Meta project={featured} />
        </div>
      </a>

      <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-6">
        {rest.map((project) => {
          //el peso en el feed lo decide el proyecto, no el orden: eso es lo
          //que rompe la cuadricula uniforme tipo instagram
          const span =
            project.size === "wide"
              ? "sm:col-span-4"
              : project.size === "tall"
                ? "sm:col-span-2"
                : "sm:col-span-3";

          const ratio =
            project.size === "wide"
              ? "aspect-[16/9]"
              : project.size === "tall"
                ? "aspect-[3/4]"
                : "aspect-[4/3]";

          return (
            <a key={project.slug} href="#" className={`group block ${span}`}>
              <Cover
                project={project}
                className={`${ratio} w-full transition duration-500 group-hover:scale-[1.01]`}
              />
              <h3 className="mt-4 text-xl font-medium text-stone-900">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-stone-600">{project.tagline}</p>
              <Meta project={project} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B · Indice: lista tipografica, la portada aparece al pasar el mouse  */
/* ------------------------------------------------------------------ */

function IndexFeed() {
  const [hovered, setHovered] = useState<LabProject | null>(null);

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-16">
      <div className="border-t border-stone-200">
        {PROJECTS.map((project, i) => (
          <a
            key={project.slug}
            href="#"
            onMouseEnter={() => setHovered(project)}
            onMouseLeave={() => setHovered(null)}
            className="group flex items-baseline gap-6 border-b border-stone-200 py-8 transition-colors"
          >
            <span className="w-8 shrink-0 text-sm text-stone-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span
              className="flex-1 text-3xl font-medium tracking-tight text-stone-900 transition-colors sm:text-4xl"
              style={hovered === project ? { color: project.accent } : undefined}
            >
              {project.title}
            </span>

            <span className="hidden text-sm text-stone-500 sm:block">
              {project.tagline}
            </span>

            <span className="w-14 shrink-0 text-right text-sm text-stone-400 tabular-nums">
              {project.year}
            </span>

            {/* en mobile no hay hover, la portada va inline y chica */}
            <Cover
              project={project}
              className="h-14 w-14 shrink-0 rounded-xl sm:hidden"
            />
          </a>
        ))}
      </div>

      {hovered && (
        <div className="pointer-events-none fixed top-1/2 right-16 hidden w-72 -translate-y-1/2 lg:block">
          <Cover project={hovered} className="aspect-[4/5] w-full shadow-2xl" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C · Sangre completa: un proyecto por pantalla, el color manda        */
/* ------------------------------------------------------------------ */

function FullBleedFeed() {
  return (
    <div>
      {PROJECTS.map((project) => (
        <a
          key={project.slug}
          href="#"
          className="group relative flex min-h-[85vh] items-end overflow-hidden"
          style={{ backgroundImage: project.cover }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 text-white">
            <p className="text-xs font-medium tracking-widest uppercase opacity-80">
              {project.client} · {project.year}
            </p>
            <h2 className="mt-3 text-5xl font-semibold tracking-tight sm:text-7xl">
              {project.title}
            </h2>
            <p className="mt-3 max-w-lg text-lg opacity-90">{project.tagline}</p>
            <span className="mt-6 inline-block border-b border-white/60 pb-1 text-sm opacity-0 transition group-hover:opacity-100">
              Ver proyecto
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D · Pagina de proyecto: la narrativa por bloques del doc de producto */
/* ------------------------------------------------------------------ */

function ProjectPageMock() {
  const project = PROJECTS[0];

  return (
    <article>
      <header
        className="px-6 py-24 text-center"
        //el acento del proyecto tine su propia pagina: misma estructura,
        //identidad distinta para cada uno
        style={{ backgroundColor: `${project.accent}14` }}
      >
        <p
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: project.accent }}
        >
          {project.client} · {project.year}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
          {project.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
          {project.tagline}
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* bloque: imagen a lo ancho */}
        <Cover project={project} className="aspect-[16/9] w-full" />

        {/* bloque: texto */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-sm font-medium tracking-widest text-stone-400 uppercase">
            Contexto
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone-700">
            Una cafeteria de barrio que llevaba tres anos operando sin identidad
            propia. El reto no era inventar una marca desde cero, sino ordenar
            lo que ya existia y darle una voz reconocible.
          </p>
        </div>

        {/* bloque: dos imagenes */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Cover project={project} className="aspect-[4/5] w-full" />
          <Cover project={PROJECTS[2]} className="aspect-[4/5] w-full" />
        </div>

        {/* bloque: cita */}
        <blockquote
          className="mx-auto mt-16 max-w-2xl border-l-2 pl-6 text-2xl leading-relaxed text-stone-800"
          style={{ borderColor: project.accent }}
        >
          El color salio del tostado del cafe, no de una paleta de moda.
        </blockquote>

        {/* bloque: galeria */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PROJECTS.slice(0, 3).map((p) => (
            <Cover key={p.slug} project={p} className="aspect-square w-full" />
          ))}
        </div>
      </div>

      <footer className="border-t border-stone-200">
        <a
          href="#"
          className="group mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-12"
        >
          <div>
            <p className="text-sm text-stone-500">Siguiente proyecto</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
              {PROJECTS[1].title}
            </p>
          </div>
          <Cover
            project={PROJECTS[1]}
            className="h-24 w-32 shrink-0 transition group-hover:scale-105"
          />
        </a>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */

export default function FeedLabPage() {
  const [variant, setVariant] = useState<VariantId>("editorial");

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Mitzuri</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            maqueta temporal
          </span>

          <nav className="ml-auto flex flex-wrap gap-1">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={
                  variant === v.id
                    ? "rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
                    : "rounded-lg px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
                }
              >
                {v.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {variant === "editorial" && <EditorialFeed />}
      {variant === "indice" && <IndexFeed />}
      {variant === "sangre" && <FullBleedFeed />}
      {variant === "proyecto" && <ProjectPageMock />}
    </div>
  );
}
