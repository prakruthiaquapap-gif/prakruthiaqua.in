# Prakruthi Aqua Android APK

This Capacitor Android app opens https://prakruthiaqua.in/ in a native Android WebView. It needs an internet connection. Changes deployed to that website are reflected in the app. This does not deploy the local Next.js project, bundle its API routes, or make localhost accessible on a phone.

- App name: Prakruthi Aqua
- Application ID: in.prakruthiaqua.app
- Android minimum: 7.0 (API 24)
- Build: Java 21, Android SDK platform 36 and Build Tools 35.0.0
- Assets: supplied Prakruthi Aqua logo; native forest-green splash screen
- APK output: output/android/Prakruthi-Aqua-debug.apk

## Build locally

Install dependencies with `npm ci`. Install Java 21 and Android SDK tools, set `JAVA_HOME` and `ANDROID_HOME`, and install platform 36 plus Build Tools 35.0.0. The local build script also detects the ignored `.android-toolchain` folder when present.

```sh
npm run android:apk
```

Override the live website only when deliberately targeting another HTTPS deployment:

```sh
CAPACITOR_SERVER_URL=https://your-deployment.example/ npm run android:apk
```

The debug APK is signed with a debug key and intended for installation and testing. For Play Store distribution, configure an owner-controlled release signing key, increase the version code for future releases, and produce a release AAB. No Play Store upload, signing credentials, or store listing is created by this setup.

## GitHub Actions

1. Commit and push the latest Android source, app-video.js, capacitor.config.ts, package files, mobile-web, scripts and .github/workflows/android_build.yml to the repository. The workflow must exist on the default branch for its Run workflow button to appear.
2. Open https://github.com/prakruthiaquapap-gif/prakruthiaqua.in/actions/workflows/android_build.yml and choose **Run workflow**.
3. Select the branch with your latest changes and keep the website URL as https://prakruthiaqua.in/. Click **Run workflow**.
4. Open the new run and wait for the build to finish successfully.
5. Scroll to **Artifacts**, download **Prakruthi-Aqua-APK-<run number>**, extract its ZIP and install **Prakruthi-Aqua-debug.apk**. The included build-info.json identifies the source commit; SHA256SUMS.txt identifies the APK.

GitHub runners generate a different debug signing key from a local build. If Android refuses the update because signatures differ, uninstall the old test app before installing the GitHub APK (this clears its local app data). An owner-controlled release signing key is needed for consistent production updates.

Building on GitHub uses the same Android source; changing the build machine alone does not establish that a device-specific playback issue is resolved. The workflow does not need website database, payment or email secrets: those belong on the hosted Next.js server and must never be bundled in the app.

## Permissions and testing

Internet access is required. Foreground location permissions are declared so the website's current-location button can request permission on demand; location is not requested on launch. Phone, email, WhatsApp and non-store links are opened using Android's available external handlers. No background location permission is requested. Cleartext traffic and mixed content are disabled.

Verify on a real Android phone before distribution: startup/offline state, login/logout, checkout/payment redirects, links opening WhatsApp or the dialer, back navigation, location permission denied/allowed, and image/file upload. Build/signature verification alone does not verify those device flows. Website functionality depends on the version currently deployed at the configured URL.

### Android 1.0.1

The native wrapper reserves space for status/navigation bars, display cutouts and the keyboard. Background video playback no longer requires a user gesture. An app-only patch on the two trusted store hosts disables background video controls and fits the welcome video inside the available screen without cropping its logo. This patch is packaged in the APK; it does not require a website deployment. Build and APK signature verification passed; physical-device playback and inset checks remain required.

### Android 1.0.4

The mobile welcome video now fills the screen with a centered portrait crop of the tree. The blurred duplicate video has been removed. The native transparent video poster and safe system-bar insets are retained.

### Android 1.0.5

Android system Back now navigates the WebView's store history (including client-side routes). If there is no previous store page, a nested page returns to the homepage. Back at the homepage without prior store history asks Stay/Exit instead of immediately closing the app. Initial blank/offline pages are excluded from back navigation. Verify button and gesture navigation on a physical Android device.

### Android 1.0.6

APK-only banner compatibility mode uses the store's existing banner images instead of background video, avoiding device decoder green frames. After the intro closes, it resets the site's carousel to the first slide before revealing it. Website playback/design is unchanged. A mocked DOM check verified intro gating, one-time first-slide reset and image fallback. Physical device verification is still required.

### Android 1.0.7

Restores the website's actual banner video sources in the APK. Removes the 1.0.6 image-only override. Banner playback waits for the intro to finish, then starts the first slide from time zero, reducing concurrent video playback. Keeps native poster suppression, portrait intro and back navigation. Mocked DOM checks cover source preservation, intro gating and video restart; Android-device playback still requires verification.

## Release AAB

Run `npm run android:aab` to build `output/android/Prakruthi-Aqua-release-unsigned.aab`. This is a release bundle, not an installable APK. It must be signed with your upload key before submission to Play Console.

To sign during the build, set all four environment variables: `ANDROID_KEYSTORE_PATH` (absolute path), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`. Then rerun `npm run android:aab`; the signed output is `output/android/Prakruthi-Aqua-release.aab`. Reuse the existing upload key for an existing Play app. Keep the key and passwords backed up privately; never commit them.

For GitHub: commit/push the latest changes, open Actions → **Build Prakruthi Aqua AAB** → **Run workflow**, keep the live website URL, wait for success and download **Prakruthi-Aqua-AAB-[run number]** from Artifacts. This workflow signs the bundle using four repository Actions secrets: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS and ANDROID_KEY_PASSWORD. Setup instructions and values are in the private upload-key backup, which must never be committed.

A new upload key was created for the first upload at the owner’s request. Private local storage is `.android-signing/` (ignored). Download and securely retain `output/android/Prakruthi-Aqua-upload-key-backup.zip`. The signed release output is `output/android/Prakruthi-Aqua-release.aab`.

### Android 1.0.8

Minimum SDK raised to 24 for Play automatic protection. Version code 9; signed with the same upload key as the first AAB. Requires Android 7.0 or later.

### Android 1.0.9

Targets and compiles against API 36, with minimum SDK 24 and version code 10. Android Gradle Plugin upgraded to 8.10.1 (supports API 36 with existing Gradle 8.11.1). Uses the same upload signing key.

### Android 1.0.10

New signed release bundle, version code 11. Retains target/compile SDK 36, minimum SDK 24 and the original upload key. The app loads the hosted website; local footer changes appear after website deployment.

### Android 1.0.11 and 1.0.12

Additional signed AABs requested by the owner: version 1.0.11 (code 12) and version 1.0.12 (code 13). Both retain minimum SDK 24, target/compile SDK 36 and the original upload signing key. No feature changes between these two bundles. Source version remains at the newer release, 1.0.12/code 13.

## Signed release APK

Run `npm run android:apk:release` with the same four upload-key signing environment variables used for the release AAB. Output: `output/android/Prakruthi-Aqua-release.apk`. This is directly installable on Android. It uses the upload certificate; Google Play-installed copies may use a different Play App Signing certificate.
