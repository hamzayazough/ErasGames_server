This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Git**

## Complete Local Development Setup

### Option 1: Quick Setup (Web Development)

If you want to develop and test in a web browser (easiest option):

1. **Clone the repository:**

   ```bash
   git clone https://github.com/hamzayazough/ErasGames_server.git
   cd ErasGames_server/ErasGamesClient
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install React Native Web (for browser development):**

   ```bash
   npm install react-native-web react-dom
   ```

4. **Start the Metro bundler:**

   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:8081` to see the React Native development interface.

### Option 2: Full Android Setup (Complete Mobile Development)

For full Android development with emulator/device testing:

#### Step 1: Install Android Studio and SDK

1. **Download and install Android Studio** from [developer.android.com](https://developer.android.com/studio)

2. **During installation, make sure to install:**
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (AVD)

#### Step 2: Configure Environment Variables (Windows)

Open PowerShell as Administrator and run:

```powershell
# Set ANDROID_HOME environment variable
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")

# Add Android tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$androidTools = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools;C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\tools;C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\emulator"
[Environment]::SetEnvironmentVariable("PATH", "$currentPath;$androidTools", "User")
```

**Restart your terminal** after setting environment variables.

#### Step 3: Create local.properties file

In the project's `android/` directory, create a file named `local.properties`:

```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

Replace `YOUR_USERNAME` with your actual Windows username.

#### Step 4: Set up Android Virtual Device (AVD)

1. Open Android Studio
2. Go to **Tools > AVD Manager**
3. Click **Create Virtual Device**
4. Choose a device (e.g., Pixel 4)
5. Select a system image (API 30+ recommended)
6. Name your AVD and click **Finish**

#### Step 5: Verify Setup

Test your Android environment:

```bash
# Check if adb is working
adb version

# List available emulators
emulator -list-avds

# Check environment variables
echo $env:ANDROID_HOME  # Should show your Android SDK path
```

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide if you encounter issues.

## Running the Application

### For Web Development (Simple)

1. **Clone and install:**

   ```bash
   git clone https://github.com/hamzayazough/ErasGames_server.git
   cd ErasGames_server/ErasGamesClient
   npm install
   npm install react-native-web react-dom
   ```

2. **Start Metro bundler:**

   ```bash
   npm start
   ```

3. **Open browser:**
   Visit `http://localhost:8081` for the development interface.

### For Android Development (Full Setup)

After completing the Android setup above:

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

**Method 1: Using npm/yarn (Recommended)**

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

**Method 2: Start emulator manually**

```sh
# Start your AVD first
emulator -avd YOUR_AVD_NAME

# Then in another terminal
npm run android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

## Common Issues and Solutions

### Android Development Issues

#### 1. "SDK location not found" Error

```
FAILURE: Build failed with an exception.
> SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable...
```

**Solution:**

1. Ensure ANDROID_HOME is set: `echo $env:ANDROID_HOME`
2. Create/verify `android/local.properties` file exists with correct SDK path
3. Restart your terminal after setting environment variables

#### 2. "adb is not recognized" Error

```
'adb' is not recognized as an internal or external command
```

**Solution:**
Add Android SDK platform-tools to your PATH:

```powershell
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
```

#### 3. "No emulators found" Error

```
error Failed to launch emulator. Reason: No emulators found as an output of `emulator -list-avds`.
```

**Solution:**

1. Open Android Studio > Tools > AVD Manager
2. Create a new Virtual Device
3. Verify with: `emulator -list-avds`

#### 4. Environment Variables Not Persisting

If environment variables reset after closing terminal:

**Permanent solution (Windows):**

```powershell
# Run as Administrator
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
```

#### 5. Build Fails with Gradle Issues

```
A problem occurred configuring project ':app'.
```

**Solution:**

1. Clean the project: `cd android && ./gradlew clean && cd ..`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Reset Metro cache: `npx react-native start --reset-cache`

### Metro Bundler Issues

#### Metro bundler not starting

```bash
# Reset Metro cache
npx react-native start --reset-cache

# Or clear watchman (if installed)
watchman watch-del-all
```

### Development Tips

#### Quick Setup Script

Create a `setup.bat` file in your project root:

```batch
@echo off
echo Setting up React Native environment...
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\emulator
echo sdk.dir=%ANDROID_HOME:\=\\% > android\local.properties
echo Setup complete!
```

#### Useful Commands

```bash
# Check React Native environment
npx react-native doctor

# List connected devices
adb devices

# Check Android SDK installation
sdkmanager --list

# Start specific emulator
emulator -avd YOUR_AVD_NAME
```

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
