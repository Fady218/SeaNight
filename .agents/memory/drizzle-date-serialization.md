---
name: Drizzle date serialization
description: Drizzle ORM returns Date objects for timestamp columns, but Orval-generated Zod schemas expect strings — must serialize before parsing.
---

## Rule
Always wrap DB query results in `serializeDates()` before passing to Zod `.parse()`.

```ts
import { serializeDates } from "../lib/serialize";
res.json(ListPropertiesResponse.parse(serializeDates(properties)));
```

The `serializeDates` helper in `artifacts/api-server/src/lib/serialize.ts` uses `JSON.parse(JSON.stringify(obj))` which converts Date → ISO string automatically.

**Why:** Drizzle selects return native JS `Date` objects for `timestamp` columns. Orval generates Zod schemas from OpenAPI, where dates are typed as `type: string`. The mismatch causes a ZodError: "Expected string, received date". This only manifests when rows actually exist — an empty result set passes Zod with no date fields, so the bug is invisible until data is seeded.

**How to apply:** Every Express route handler that does `.parse(dbResult)` must first wrap `dbResult` in `serializeDates()`. Applies to all routes: properties, bookings, users, reviews.
