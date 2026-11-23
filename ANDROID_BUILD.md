# Prakruthi Aqua Android APK

This Capacitor Android app opens https://prakruthiaqua.in/ in a native Android WebView. It needs an internet connection. Changes deployed to that website are reflected in the app. This does not deploy the local Next.js project, bundle its API routes, or make localhost accessible on a phone.

- App name: Prakruthi Aqua
- Application ID: in.prakruthiaqua.app
- Android minimum: 6.0 (API 23)
- Build: Java 21, Android SDK platform 35 and Build Tools 35.0.0
- Assets: supplied Prakruthi Aqua logo; native forest-green splash screen
- APK output: output/android/Prakruthi-Aqua-debug.apk

## Build locally

Install dependencies with `npm ci`. Install Java 21 and Android SDK tools, set `JAVA_HOME` and `ANDROID_HOME`, and install platform 35 plus Build Tools 35.0.0. The local build script also detects the ignored `.android-toolchain` folder when present.

```sh
npm run android:apk
```

Override the live website only when deliberately targeting another HTTPS deployment:

```sh
CAPACITOR_SERVER_URL=https://your-deployment.example/ npm run android:apk
```

The debug APK is signed with a debug key and intended for installation and testing. For Play Store distribution, configure an owner-controlled release signing key, increase the version code for future releases, and produce a release AAB. No Play Store upload, signing credentials, or store listing is created by this setup.

## GitHub Actions

After adding these files to your own repository, manually run **Build Prakruthi Aqua APK** in Actions and enter the live website URL. Download the resulting APK artifact. The workflow does not need website database, payment or email secrets: those belong on the hosted Next.js server and must never be bundled in the app.

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
