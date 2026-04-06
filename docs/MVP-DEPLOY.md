# EMBER MVP — deploy and test

This guide assumes [Expo Application Services (EAS)](https://docs.expo.dev/eas/) and an Expo account. Use it to produce installable builds for internal testing (TestFlight, Play internal track, or dev clients).

## Prerequisites

- Apple Developer Program membership for iOS distribution.
- Google Play Console for Android (internal testing at minimum).
- Repository dependencies installed (`npm install`).
- `eas-cli` logged in (`npx eas login`).

## One-time project setup

1. **EAS project**: run `npx eas init` if the project is not linked yet (creates or links an Expo project ID in `app.json` / `app.config`).
2. **Bundle identifiers**: ensure `ios.bundleIdentifier` and `android.package` in your Expo config match the apps you will create in App Store Connect and Play Console.
3. **Credentials**: let EAS manage credentials for the first build, or upload your own distribution certs and provisioning profiles from the EAS dashboard.

## Build profiles

The repo includes `eas.json` with:

- **development** — dev client, internal distribution, `APP_ENV=development`.
- **preview** — release-style internal builds for QA, `APP_ENV=preview`.
- **production** — store-oriented builds with `autoIncrement`, `APP_ENV=production`.

Commands:

```bash
npm run build:dev
npm run build:preview
npm run build:prod
```

Platform-specific examples:

```bash
npx eas build --profile preview --platform ios
npx eas build --profile preview --platform android
```

## Submit placeholders

`eas.json` → `submit.production` uses placeholder values for Apple and Google:

- Replace `YOUR_APPLE_ID`, `YOUR_ASC_APP_ID`, and `YOUR_TEAM_ID` with real values before `eas submit`.
- For Android, set `serviceAccountKeyPath` to a **Google Play service account JSON key** file path (not `google-services.json`, which is for Firebase client config). Create a service account in Play Console with release permissions and download the JSON key.

Keep secrets out of git: use EAS [environment variables](https://docs.expo.dev/eas/environment-variables/) or local files listed in `.gitignore`.

## Testing the MVP locally

1. **Simulator / device**: `npx expo start` then run the dev client or Expo Go where compatible (WatermelonDB + native modules may require a dev client: `npm run build:dev`).
2. **Flows to verify**:
   - Splash → onboarding with display name → create or join community.
   - After restart: app hydrates persisted app state, restores crypto session from SecureStore when onboarded, and reloads community rows from SQLite/Loki.
   - Check-in and resource edits persist to WatermelonDB (same device).

## Security notes for MVP review

- Passphrase verification uses a **SHA-256 hash** stored on the community record; this is suitable for a local gate, **not** a replacement for a server-side secret store in a multi-tenant cloud backend.
- Community **KDF salt** is stored per community (`derivation_salt`); derived keys are cached with **`expo-secure-store`** after unlock.
- Mesh and cross-device sync are **not** part of this MVP path; treat data as **device-local** until replication is implemented.

## Optional: seed data

`seedDatabase()` in `src/db/seed.ts` is for development demos. Seeded invite codes and hashes do not match live onboarding crypto unless you align passphrases and hashes intentionally.
