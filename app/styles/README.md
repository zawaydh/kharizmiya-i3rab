# CSS architecture

The active styles are imported in numeric order from `app/globals.css`.

- `00-foundation.css`: tokens and shared primitives.
- `10-shell-auth-exercise.css`: shell, authentication, and base exercise pages.
- `20-navigation-paths.css`: navigation and visual-path foundations.
- `30-start-learning-core.css`: start experience and core learning UI.
- `40-learning-flow.css`: sequencing, hints, and learning flow.
- `50-exercise-workspace.css`: exercise workspace foundations.
- `60-exercise-stability.css`: progress, results, and practice behavior.
- `70-pages-games-dashboard.css`: home, games, dashboard, and supporting pages.
- `80-clean-system.css`: the only final visual layer. It defines one responsive sidebar model, one Arabic type scale, one workspace frame, and responsive behavior.

Previous competing final layers were moved to `app/styles/legacy/` and are not imported. Do not add another patch file after `80-clean-system.css`; update the clean system or the relevant foundation module instead.
