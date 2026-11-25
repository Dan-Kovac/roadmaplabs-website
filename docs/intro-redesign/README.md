# /intake intro redesign: before and after

Screenshots at 1280x800 (desktop) and 390x844 (mobile), 2x pixel density, reduced motion, dev toolbar hidden.
`-scrolled` shots show the bottom of a screen that is taller than the viewport (the Next row stays pinned).

| Screen | Before | After |
| --- | --- | --- |
| 1 Welcome + header mark | before-*-screen1-welcome | after-*-screen1-welcome |
| 2 Why we're doing this | before-*-screen2-why ("One answer becomes context") | after-*-screen2-why |
| 3 How it works | before-*-screen3-how ("Files form your folder") | after-*-screen3-how |
| (removed) An agent gets to work | before-*-removed-agent-gets-to-work | none |
| 4 What we'll cover | before-*-screen4-cover ("What Harry will gather") | after-*-screen4-cover |
| 5 The more specific, the better | before-*-screen5-specific | after-*-screen5-specific |
| First chat screen | before-*-screen6-chat-start | after-*-screen6-chat-start |

Intro content lives in `src/data/intake-intro.ts` (owner version is the default; an employee version can be added there).
