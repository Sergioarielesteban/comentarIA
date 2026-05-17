import { Header } from "@/components/layout/header";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header title={title} subtitle={subtitle} showBrand={!title} />
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28">{children}</main>
    </>
  );
}
