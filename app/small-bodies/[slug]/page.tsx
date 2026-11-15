import { bodies } from "@/lib/catalog";
import { BodyRoute } from "@/components/ui/body-page";

export function generateStaticParams() {
  return bodies.filter((body) => body.kind === "small-body").map((body) => ({ slug: body.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BodyRoute slug={slug} kind="small-body" />;
}
