import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";

let manager: BleManager | null = null;

try {
  manager = new BleManager();
} catch (err) {
  console.warn(
    "BLE Manager initialization failed. Possibly running in Expo Go.",
    err
  );
}

let monitorSubscription: Subscription | null = null;
let connectedDevice: Device | null = null;

const ensureManager = () => {
  if (!manager) {
    throw new Error(
      "BLE não disponível neste build. Use Dev Client ou APK com react-native-ble-plx."
    );
  }
  return manager;
};

export const isBleAvailable = () => manager !== null;

export const getManager = () => ensureManager();

export async function startScan(
  onDeviceFound: (d: Device) => void,
  timeout = 10000
) {
  const mgr = ensureManager();

  mgr.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
    if (error) {
      console.warn("BLE scan error:", error);
      return;
    }
    if (device) onDeviceFound(device);
  });

  setTimeout(() => {
    try {
      const mgr2 = ensureManager();
      mgr2.stopDeviceScan();
    } catch {}
  }, timeout);
}

export async function stopScan() {
  const mgr = ensureManager();
  try {
    mgr.stopDeviceScan();
  } catch {}
}

export async function connectToDevice(deviceId: string) {
  const mgr = ensureManager();

  try {
    const device = await mgr.connectToDevice(deviceId, { requestMTU: 517 });
    await device.discoverAllServicesAndCharacteristics();
    connectedDevice = device;
    return device;
  } catch (err) {
    console.warn("Erro ao conectar dispositivo:", err);
    throw err;
  }
}

export async function disconnectCurrentDevice() {
  const mgr = ensureManager();

  try {
    if (!connectedDevice) return;

    if (monitorSubscription) {
      try {
        monitorSubscription.remove();
      } catch {}
      monitorSubscription = null;
    }

    await mgr.cancelDeviceConnection(connectedDevice.id);
    connectedDevice = null;
  } catch (err) {
    console.warn("Erro ao desconectar:", err);
    throw err;
  }
}

export function monitorHeartRate(
  device: Device,
  onHeartRate: (bpm: number) => void
) {
  const serviceUUID = "180D";
  const characteristicUUID = "2A37";

  if (monitorSubscription) {
    try {
      monitorSubscription.remove();
    } catch {}
    monitorSubscription = null;
  }

  const sub = device.monitorCharacteristicForService(
    serviceUUID,
    characteristicUUID,
    (error, characteristic) => {
      if (error) {
        console.warn("monitorHeartRate error:", error);
        return;
      }

      if (!characteristic?.value) return;

      try {
        const buffer = Buffer.from(characteristic.value, "base64");
        const flags = buffer[0];
        const isUINT16 = flags & 0x01;
        const bpm = isUINT16 ? buffer.readUInt16LE(1) : buffer[1];

        onHeartRate(bpm);
      } catch (e) {
        console.warn("Erro parse HR:", e);
      }
    }
  );

  monitorSubscription = sub;

  return () => {
    try {
      sub.remove();
    } catch {}
    monitorSubscription = null;
  };
}

export function monitorRawCharacteristic(
  device: Device,
  serviceUUID: string,
  characteristicUUID: string,
  onData: (value: Uint8Array) => void
) {
  return device.monitorCharacteristicForService(
    serviceUUID,
    characteristicUUID,
    (error, characteristic) => {
      if (error) {
        console.warn("Erro monitorRawCharacteristic:", error);
        return;
      }

      if (!characteristic?.value) return;

      try {
        const raw = Buffer.from(characteristic.value, "base64");
        onData(raw);
      } catch (e) {
        console.warn("Erro ao decodificar characteristic:", e);
      }
    }
  );
}

export async function findNotifyCharacteristics(device: Device) {
  const result: {
    serviceUUID: string;
    charUUID: string;
    isReadable: boolean;
  }[] = [];

  try {
    const services = await device.services();

    for (const service of services) {
      const chars = await service.characteristics();

      for (const ch of chars) {
        if (ch.isNotifiable) {
          result.push({
            serviceUUID: service.uuid,
            charUUID: ch.uuid,
            isReadable: !!ch.isReadable,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Erro findNotifyCharacteristics:", e);
  }

  return result;
}

export function monitorStepsAndCalories(
  device: Device,
  onUpdate: (steps: number, calories: number) => void
) {
  const SVC = "00006006-0000-1000-8000-00805f9b34fb";
  const CHAR = "00008004-0000-1000-8000-00805f9b34fb";

  return device.monitorCharacteristicForService(
    SVC,
    CHAR,
    (error, characteristic) => {
      if (error) {
        console.warn("Erro monitorStepsAndCalories:", error);
        return;
      }

      if (!characteristic?.value) return;

      try {
        const raw = Buffer.from(characteristic.value, "base64");
        const steps = raw[3] + (raw[4] << 8);
        const calories = raw[5];

        onUpdate(steps, calories);
      } catch (e) {
        console.warn("Erro parse steps/calories:", e);
      }
    }
  );
}

export async function destroyManager() {
  try {
    if (monitorSubscription) {
      try {
        monitorSubscription.remove();
      } catch {}
      monitorSubscription = null;
    }

    const mgr = ensureManager();
    mgr.destroy();
  } catch {}
}
