import { MemoryGraph } from "@/components/MemoryGraph";
import { getMemoryProfile } from "@/lib/api";
import { MOCK_USER_ID } from "@/lib/user";

export default async function MemoryPage() {
  const memory = await getMemoryProfile(MOCK_USER_ID);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Memory Profile</h1>
      <MemoryGraph profile={memory.profile ?? {}} />
    </div>
  );
}

