// Slugs are Persian, so they travel down the wire percent-encoded and Next
// hands them to the route still encoded. Every lookup that compares a slug to
// stored data — or forwards it to the Payload API, which encodes again — has to
// decode first, or it searches for the literal text "%D8%A2..." and 404s.
//
// Latin slugs never showed this: they survive encoding unchanged.
export const decodeSlugParam = (slug: string): string => {
  try {
    return decodeURIComponent(slug)
  } catch {
    // A stray "%" that is not a valid escape — use it as typed rather than throw.
    return slug
  }
}
