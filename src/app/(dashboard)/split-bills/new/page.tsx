import { requireSessionUser } from "@/lib/auth/require-session";
import { narrowPageClass, pageStackClass } from "@/components/ui/styles";
import { listFriends } from "@/modules/friends";
import { MakeBillWizard } from "@/modules/split-bills";

export const dynamic = "force-dynamic";

export default async function NewSplitBillPage() {
  const user = await requireSessionUser();
  const friends = await listFriends(user.id);
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <MakeBillWizard friends={friends} />
    </div>
  );
}