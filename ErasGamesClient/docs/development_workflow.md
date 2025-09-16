# React Native Development Workflow

## Commands & Explanations

### `npm start`

- Starts the **Metro Bundler**, which is a server that converts modern JavaScript into code mobile devices understand.
- Serves the app to connected devices/emulators.
- Enables **Hot Reloading** (changes appear instantly).

---

### `$env:ANDROID_HOME = "C:\Users\hamza\AppData\Local\Android\Sdk"`

- Tells all Android tools that the **Android SDK** is located at that path.

---

### `$env:PATH += ";platform-tools;tools;emulator"`

- Adds Android commands (`adb`, `emulator`) to the system command list.
- You can now type `adb` anywhere, and Windows will find it.

---

### `sdk.dir=C:\\Users\\hamza\\AppData\\Local\\Android\\Sdk`

- Gives **Gradle** (the Android build system) the location of the Android SDK.

---

### `npx react-native run-android`

- Finds the Android SDK using `ANDROID_HOME`.
- Builds the Android app (compiles React Native code into an APK).
- Installs the APK on the emulator (virtual device).
- Connects to **Metro** (development server).
- Starts the app on the emulator.

---

## Flow

App.tsx
↓
Metro Bundler (watch code & convert automatically)
↓
Android Build System (Gradle)
↓
Android Emulator (Virtual Device)
↓
Running the App

---

## Debug Workflow

1. Edit `App.tsx`.
2. Metro detects the change.
3. Metro sends updated code to the emulator.
4. App updates instantly (**Hot Reload**).
5. Use **Chrome DevTools** to debug the JavaScript.
