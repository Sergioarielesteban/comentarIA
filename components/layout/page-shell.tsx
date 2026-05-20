import { AppHeader } from "@/components/layout/header";

export function PageShell({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <>
      {!hideHeader ? <AppHeader /> : null}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 lg:pb-8 sm:px-6 sm:py-8">
        {children}
      </main>
    </>
  );
}
