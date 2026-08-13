# Life Simulator Website — Deployment Ready

Static GitHub Pages-compatible website for:

- Game: Life Simulator
- Publisher: Rocket Games
- Version: 1.0
- Platform: Android
- Price: Free

## Firebase project

This build is already configured for:

`rocket-website-9609a`

The website expects this Firestore document:

`publicReleases/life-simulator`

Recommended fields:

- `name` — string — `Life Simulator`
- `publisher` — string — `Rocket Games`
- `version` — string — `1.0`
- `versionCode` — number — `1`
- `status` — string — `Available`
- `storagePath` — string — `public/game/life-simulator/life-simulator-1.0.apk`
- `downloadCount` — number — `0`

The APK must exist in Firebase Storage at exactly the same path used by `storagePath`.

## Firebase rules

Deploy the included:

- `firestore.rules`
- `storage.rules`

The Firestore rules allow public release reads and only permit `downloadCount` to increase by exactly 1.

The Storage rules allow public reads only under:

`public/game/`

and deny public writes everywhere.

## GitHub Pages deployment

Upload the contents of this folder to the repository root.

The important root files are:

- `index.html`
- `mods.html`
- `styles.css`
- `assets/`
- `js/`

Then enable GitHub Pages for the repository branch you want to publish.

## Mods

Mods are available only through the header navigation and use the exact mod data structure in:

`js/data.js`

Mod download links remain external.

## Optional security improvement

Firebase App Check support is already scaffolded in `js/firebase.js`.

When you create a reCAPTCHA Enterprise App Check site key, replace:

`REPLACE_WITH_RECAPTCHA_ENTERPRISE_SITE_KEY`

Then verify App Check metrics before enabling enforcement.
