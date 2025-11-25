// src/utils/permissions.ts
import { Platform, PermissionsAndroid } from "react-native";
import { request, check, PERMISSIONS, RESULTS } from "react-native-permissions";

export async function requestBlePermissions() {
  if (Platform.OS !== "android") return true;

  // Android 12+ permissions via react-native-permissions
  const scan = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
  const connect = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
  const advertise = await request(PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE);

  // Legacy / fallback (alguns aparelhos ainda dependem de localização)
  const loc = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  const okScan = scan === RESULTS.GRANTED;
  const okConnect = connect === RESULTS.GRANTED;
  const okAdvertise = advertise === RESULTS.GRANTED || advertise === RESULTS.LIMITED;
  const okLoc = loc === PermissionsAndroid.RESULTS.GRANTED;

  return okScan && okConnect && okAdvertise && okLoc;
}
