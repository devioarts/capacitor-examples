# Sample project for [capacitor-tcpclient](https://github.com/devioarts/capacitor-tcpclient)

## Instalation from GitHub

### Download and extract the repo folder (Linux/Mac)
> To folder capacitor-electron
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=1 capacitor-examples-main/capacitor-tcpclient
cd capacitor-tcpclient
```
> To current folder
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=2 capacitor-examples-main/capacitor-tcpclient
```

### Create a dist folder and install dependencies
```shell
# create dist folder
mkdir dist
# install dependencies
npm install
# first build
npm run dev:build
```
### Install iOS + Android
```shell
# add android
npx cap add android
# add ios
# if you want to use Podfile
npx cap add ios
# if you want to use SPM
npx cap add ios --packagemanager SPM
```

## Android
#### /android/app/src/main/AndroidManifest.xml
```xml

<application 
        android:usesCleartextTraffic="true" 
></application>

<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- Android 12+ -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

```

```shell
npm run cap:open-android
```

## iOS
#### /ios/App/App/Info.plist
```xml
<key>NSLocalNetworkUsageDescription</key>
<string>It is needed for the correct functioning of the application</string>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

```shell
npm run cap:open-ios
```

## Electron
```shell
npm run electron:dev
```

