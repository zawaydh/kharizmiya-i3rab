# CSS architecture

`app/globals.css` imports only the shared shell. `00-foundation.css` declares the cascade-layer order before its first layer block so the production bundler cannot move the declaration behind flattened imports. Activity and page modules are imported by the routes that use them, while the named layers preserve the same cascade order regardless of chunk loading.

- `00-foundation.css`: tokens and shared primitives.
- `10-shell-auth-exercise.css`: shell, authentication, and base exercise pages.
- `20-navigation-paths.css`: navigation and visual-path foundations.
- `30-start-learning-core.css`: start experience and core learning UI.
- `31-start-page-flow.css`: route-only progress, completion, continuation, and glossary structure for `/learn/start`.
- `40-learning-flow.css`: sequencing, hints, and learning flow.
- `50-exercise-workspace.css`: exercise workspace foundations.
- `60-exercise-stability.css`: shared question and motion stability.
- `61-exercise-feedback.css`: practice correction, feedback, and final results.
- `70-exercise-flow.css`: question motion and shared exercise-page behavior.
- `71-quiz-remedial.css`: the remedial stage used only by the quiz route.
- `72-text-game.css`: the diacritics text game.
- `73-paths-dashboard.css`: compact status and notice surfaces for paths and dashboard.
- `74-speech-game.css`: the «الإعراب في كلامنا» activity.
- `79-navigation-system.css`: final sidebar and navigation implementation.
- `80-clean-system.css`: shared tokens, shell, and base workspace surfaces.
- `80-page-system.css`: final home, topic, dashboard, and authentication surfaces.
- `81-clean-responsive.css`: responsive layout and the refined learning/result presentation.
- `82-learning-stability.css`: verified question motion, natural-height hints, and result stability.
- `83-home-glossary.css`: home learning tools and the mobile glossary surface.
- `90-algorithm-guide.css` and `91-algorithm-guide-responsive.css`: algorithm-guide pages, loaded from `/guide` only.

Modules `30` through `74` are loaded only by the routes that use them. `/learn/start` alone adds `31`; the common exercise routes load `30`, `40`, `50`, `60`, `61`, and `70`, and the quiz alone adds `71`. The text game, paths/dashboard notices, and «الإعراب في كلامنا» load `72`, `73`, and `74` respectively. Module `83` is loaded by the home and learning routes. Do not add them back to the global manifest.

These files are ordered semantic modules, not cumulative patch files. Replace rules in their owning module; do not append a new override layer. Keep short one- and two-property rules on one readable line so formatting changes do not consume the maintenance budget. The architecture test rejects repeated selector/property declarations, unbounded selector ownership, dead legacy branches, and budget overruns.
