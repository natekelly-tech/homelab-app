# LabWatch Mobile App — Release Process
Auxcon Technologies

## Branching

All work happens on feature branches. No commits go directly to main.
Open a PR against main, self-review the diff, then merge.

## Versioning

Version numbers live in app.json under the version field.
Follow semantic versioning: MAJOR.MINOR.PATCH

- PATCH: bug fixes, content changes, JS-only changes
- MINOR: new features (new screen, new capability)
- MAJOR: breaking changes to the API contract or architecture

The runtimeVersion in app.json controls which OTA bundles are
compatible with which installed native shells. Bump it when native
code changes.

## Build Profiles (eas.json)

| Profile     | Purpose                  | Audience            |
|-------------|--------------------------|---------------------|
| development | Local dev builds         | Developer only      |
| preview     | Pre-release testing      | Developer + testers |
| production  | Store submission         | End users           |

## Release Workflow

### JS-only changes (bug fixes, copy, styling)
No native code touched. Ship via OTA update.

1. Bump version in app.json (PATCH)
2. Commit and push to main
3. Run: eas update --branch production --message "fix: description"

OTA updates reach installed apps automatically on next launch.
No store review required.

### Feature releases (new screens, new dependencies)
Native code or new packages may be involved. Requires a full build.

1. Bump version in app.json
2. Commit and push to main via PR
3. Build preview binary: eas build --profile preview --platform android
4. Install on phone, test against live backend for at least one day
5. Build production binary: eas build --profile production --platform android
6. Submit to Play Store: eas submit --platform android
7. Promote through tracks in Play Console: internal -> closed beta -> production

### Rollback
OTA rollback: publish a previous bundle to the production branch.
Native rollback: promote the previous approved build in Play Console.

## Changelog

CHANGELOG.md at repo root. One entry per release.

Example:
    0.2.0 — 2026-05-01
    Added: Settings screen with configurable backend URL
    Added: AsyncStorage persistence layer
    Fixed: SafeAreaView deprecation warning

## What Never Goes to Production Automatically

Nothing. Every production release is a manual promotion step.
There is no auto-deploy to the store. The manual step is intentional.
