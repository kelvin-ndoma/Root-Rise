import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ToggleButton } from "@/components/admin/toggle-button";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { listAdminReviews } from "@/lib/services/admin.service";
import { adminReviewListQuerySchema } from "@/lib/validations/admin";
import { ReviewDeleteButton } from "@/components/admin/review-delete-button";
import { adminFieldClass } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = adminReviewListQuerySchema.parse({
    q: first(params.q),
    status: first(params.status),
    page: first(params.page),
  });
  const result = await listAdminReviews(query);

  const hrefFor = (page: number) => {
    const next = new URLSearchParams();
    if (query.q) next.set("q", query.q);
    if (query.status !== "all") next.set("status", query.status);
    next.set("page", String(page));
    return `/admin/reviews?${next.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Moderation"
        title="Reviews"
        description="Approve reviews before they affect product ratings."
      />
      <form className="mb-6 grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">
        <input name="q" defaultValue={query.q} placeholder="Search comments" className={adminFieldClass} />
        <select name="status" defaultValue={query.status} className={adminFieldClass}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <div className="space-y-4">
        {result.items.map((review) => (
          <article key={review.id} className="rounded-3xl bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{review.user?.name ?? "Customer"}</p>
                <p className="text-sm text-ink/45">
                  {review.rating}/5
                  {review.product ? (
                    <>
                      {" "}
                      on{" "}
                      <Link href={`/products/${review.product.slug}`} className="hover:text-brand">
                        {review.product.name}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
              <StatusBadge value={review.isApproved ? "ACTIVE" : "PENDING"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/70">{review.comment}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ToggleButton
                href={`/api/admin/reviews/${review.id}`}
                payload={{ isApproved: !review.isApproved }}
                label={review.isApproved ? "Unpublish" : "Approve"}
              />
              <ReviewDeleteButton id={review.id} />
            </div>
          </article>
        ))}
        {!result.items.length ? <p className="rounded-3xl bg-white px-4 py-10 text-center text-sm text-ink/50">No reviews yet.</p> : null}
      </div>
      <div className="mt-6">
        <Pagination page={result.page} pages={result.pages} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
