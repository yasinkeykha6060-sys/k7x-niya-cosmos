import { bodies } from "@/lib/catalog";
import { BodyRoute } from "@/components/ui/body-page";

export function generateStaticParams() {
  return bodies.filter((body) => body.kind === "dwarf-planet").map((body) => ({ slug: body.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BodyRoute slug={slug} kind="dwarf-planet" />;
}
