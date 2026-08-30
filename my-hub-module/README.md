# My Hub teaching module (prepared, not connected)

`teaching-panel.js` is a Phase 1 integration candidate for `branzfamily01/my-hub`.

**Do not add it to production My Hub before the architecture audit.**

When connected with:

```html
<script src="/english-classroom/my-hub-module/teaching-panel.js" defer></script>
```

it adds a floating `🎓 授業` entry and reads:

- `/english-classroom/registry/lessons.json`
- `localStorage["teaching.v1"]`

It supports:

- school year
- a remembered class list
- current class selection
- start / resume teacher lesson URL
- progress summary
- recent teaching logs
- backup age warning
- JSON backup
- JSON restore

It does not store individual student names by design. It is only an operational launcher; durable teaching-knowledge promotion remains Phase 2.
