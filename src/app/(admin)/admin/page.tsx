import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Messages</h1>
      <p className="mt-2 text-sm text-muted">
        {messages.length} submission{messages.length === 1 ? "" : "s"} from the contact form.
      </p>

      <div className="mt-8 flex flex-col">
        {messages.length === 0 && (
          <p className="border-t border-line py-8 text-sm text-muted">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="border-t border-line py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{m.name}</span>
              <span className="text-xs text-muted">
                {m.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                {m.locale.toUpperCase()}
              </span>
            </div>
            <a href={`mailto:${m.email}`} className="text-sm text-muted hover:text-fg">
              {m.email}
            </a>
            {m.budget && <p className="mt-1 text-sm text-muted">Budget: {m.budget}</p>}
            <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
