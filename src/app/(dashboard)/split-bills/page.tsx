import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import { listFriends } from "@/modules/friends";
import {
  listOwnedSplitBills,
  parseSplitBillFilters,
  SplitBillHistorySection,
} from "@/modules/split-bills";

export const dynamic = "force-dynamic";

const INITIAL_PAGE = 1 as const;
const INITIAL_PAGE_SIZE = 15 as const;

export default async function SplitBillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const parsed = parseSplitBillFilters(await searchParams);

  const filters = parsed.success
    ? { ...parsed.data, page: INITIAL_PAGE, pageSize: INITIAL_PAGE_SIZE }
    : { q: "", sort: "billDate" as const, direction: "desc" as const, page: INITIAL_PAGE, pageSize: INITIAL_PAGE_SIZE };

  const [result, friends] = await Promise.all([
    listOwnedSplitBills(user.id, filters),
    listFriends(user.id),
  ]);

  return (
    <div className={pageStackClass}>
      <SplitBillHistorySection
        key={JSON.stringify(filters)}
        filters={filters}
        initialRows={result.rows}
        total={result.total}
        friends={friends}
      />
    </div>
  );
}
