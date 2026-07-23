# CSS architecture

The files are imported in numeric order from `app/globals.css`. The order is intentional because the project contains legacy selectors whose final cascade is preserved.

- `00-foundation.css`: tokens and shared primitives.
- `10-shell-auth-exercise.css`: shell, authentication, and base exercise pages.
- `20-navigation-paths.css`: navigation and visual-path foundations.
- `30-start-learning-core.css`: start experience and core learning UI.
- `40-learning-flow.css`: sequencing, hints, and mobile learning flow.
- `50-exercise-workspace.css`: focused exercise workspace.
- `60-exercise-stability.css`: progress, results, practice, and accessibility behavior.
- `70-pages-games-dashboard.css`: home, games, dashboard, and other pages.
- `80-typography-responsive.css`: Arabic typography, diacritics, and responsive rules.
- `90-formal-theme.css`: final formal educational visual system.

New visual changes should normally be placed in the relevant module. Avoid adding another global override section unless a cross-platform token genuinely belongs in `90-formal-theme.css`.

- `95-classic-readable.css`: restores the clear Cairo-based academic reading style and the light topic/exercise surfaces inspired by the earlier prototypes.
