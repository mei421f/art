export type ProjectViewModel = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
};

export default function ProjectRow({ project }: { project: ProjectViewModel }) {
  return (
    <div className="group grid grid-cols-1 items-baseline gap-2 border-b border-line py-8 transition-colors md:grid-cols-[1fr_auto_auto] md:gap-8">
      <div>
        <h3 className="font-display text-3xl transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 md:text-4xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.tagline}</p>
      </div>
      <span className="text-sm text-muted">{project.category}</span>
      <span className="text-sm text-muted">{project.year}</span>
    </div>
  );
}
