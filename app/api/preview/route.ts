import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// Entry point for «پیش‌نمایش» in the Payload admin.
//
// Payload builds this URL with the article's slug, a shared secret and the
// editor's own JWT. The secret proves the link came from the CMS; the token is
// what actually authorises reading an unpublished draft, and it is stored in an
// httpOnly cookie so the blog page can present it on the API call and nothing in
// the browser can read it back out.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const token = searchParams.get("token");

  const expected = process.env.PREVIEW_SECRET;
  if (!expected) {
    return new Response("پیش‌نمایش پیکربندی نشده است (PREVIEW_SECRET).", { status: 500 });
  }
  if (secret !== expected || !slug) {
    return new Response("درخواست پیش‌نمایش نامعتبر است.", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  if (token) {
    // draftMode().enable() already set its own cookie; add the credential beside
    // it. Same lifetime — clearing draft mode leaves this behind harmlessly, but
    // it is scoped to the preview route's needs either way.
    const { cookies } = await import("next/headers");
    (await cookies()).set("payload-preview-token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(`/blog/${encodeURIComponent(slug)}`);
}
