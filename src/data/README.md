# Timeline Data

`timeline.json` is the source of truth for the detailed timeline visualization.

Each entry needs:

- `lane`: One of the lane names listed in `lanes`.
- `start`: Decimal year used for positioning.
- `end`: Decimal year used for positioning.
- `dates`: Human-readable date range shown on the card.
- `title`: Role, degree, or project name.
- `organization`: Institution, company, or project.
- `summary`: Short extra note shown when the card is expanded.

Approximate decimal month values:

- Jan: `.00`
- Feb: `.08`
- Mar: `.17`
- Apr: `.25`
- May: `.33`
- Jun: `.42`
- Jul: `.50`
- Aug: `.58`
- Sep: `.67`
- Oct: `.75`
- Nov: `.83`
- Dec: `.92`

Keep one-off talks, awards, and publications out of this file unless they are meant to appear as timeline duration entries. They will work better in a separate talks/writing section.
