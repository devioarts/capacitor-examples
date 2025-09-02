# Sample project for [capacitor-mdns](https://github.com/devioarts/capacitor-mdns)

## Instalation from GitHub

### Download and extract the repo folder (Linux/Mac)
> To folder capacitor-mdns
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=1 capacitor-examples-main/capacitor-mdns
cd capacitor-mdns
```
> To current folder
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=2 capacitor-examples-main/capacitor-mdns
```

### Create a dist folder and install dependencies
```shell
# create dist folder
mkdir dist
# install dependencies
npm install
```
### Install iOS + Android
```shell
# first build
npm run dev:build
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
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- Android 12+ -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<application android:usesCleartextTraffic="true"></application>
```
#### /android/app/build.gradle
```text
packaging {
    resources {
        excludes.add("META-INF/INDEX.LIST")
        excludes.add("META-INF/io.netty.versions.properties")
        excludes.addAll([
            "META-INF/DEPENDENCIES",
            "META-INF/LICENSE",
            "META-INF/LICENSE.*",
            "META-INF/NOTICE",
            "META-INF/NOTICE.*",
            "META-INF/AL2.0",
            "META-INF/LGPL2.1"
        ])
    }
}
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
<key>NSBonjourServices</key>
<array>
    <string>_http._tcp</string>
</array>
```