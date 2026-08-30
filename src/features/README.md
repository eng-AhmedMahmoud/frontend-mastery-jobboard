# `src/features` — business subdomains

One folder per subdomain of the product. Each is a small application in its own right:

```
features/<subdomain>/
  api/            the client side of its endpoints
  components/     its UI
  hooks/          its state and behaviour
  index.ts        the front door — the only thing anyone outside may import
```

Two rules, both enforced by lint:

- **Nothing reaches past `index.ts`.** `@/features/jobs` is legal; `@/features/jobs/components/job-card` is not.
- **Features never import each other.** Wire them in `src/app`, or push the shared piece
  down into `domain`, `ui` or `utils`.

Present today:

| Feature | Owns | Course module |
|---|---|:--:|
| `jobs` | the listings feed, filters, the detail panel | 5 · 8 |
| `search` | the autocomplete | 7 |
| `applications` | applying, and the optimistic update | 8 |

Arriving later: `perf-lab` (module 2 — a deliberately slow page to instrument) and
`employers` (module 9 — the company dashboard, behind auth).
