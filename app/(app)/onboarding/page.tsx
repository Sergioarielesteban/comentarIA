import { PageShell } from "@/components/layout/page-shell";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <PageShell title="Configurar restaurante">
      <OnboardingFlow />
    </PageShell>
  );
}
