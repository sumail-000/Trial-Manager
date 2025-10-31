import { use } from "react";
import { TrialDetailView } from "@/features/trials/components/TrialDetailView";

export default function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TrialDetailView trialId={id} />;
}

