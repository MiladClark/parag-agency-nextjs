// Which tenant this site instance represents. When the shared Payload CMS gains
// the multi-tenant plugin, each of the 3 sites sets its own NEXT_PUBLIC_TENANT
// and the repository scopes every blog query to it. Defaults to "parag".
export const CURRENT_TENANT = process.env.NEXT_PUBLIC_TENANT ?? "parag";
