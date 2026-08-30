# `src/ui` — design-system primitives

Empty until module 6, on purpose.

A component belongs here when it takes props and emits events and has **no idea what a job
is**. `Button`, `Select`, `Field`, `Modal`, `Dropdown`, `Tabs`, `Toast`, `VirtualList`.

A component belongs in `src/features/<subdomain>/components/` instead the moment it names a
business concept — `JobCard` knows about jobs, so it is not a primitive.

The lint rules enforce the difference: nothing here may import from `@/features`, `@/data`,
`@/app` or `@/domain`. If a primitive seems to need one of those, it needs a prop.

Filled by:

| Module | Adds |
|---|---|
| 6 | `button/` · `select/` · `field/` — typed, polymorphic, variant-driven |
| 7 | `modal/` · `dropdown/` · `tabs/` · `toast/` · `virtual-list/` |
