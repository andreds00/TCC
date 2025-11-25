import { Device } from "react-native-ble-plx";
import {
  findNotifyCharacteristics,
  monitorRawCharacteristic,
  monitorStepsAndCalories,
} from "@/lib/bluetooth";
import { getStepsCaloriesActive } from "@/lib/healthConnect"; // seu arquivo HealthConnect
import { Buffer } from "buffer";

let bleSubs: (() => void)[] = [];

export function stopHybrid() {
  bleSubs.forEach(fn => { try { fn(); } catch {} });
  bleSubs = [];
}

export async function startHybridStepsSubscription(
  device: Device | null,
  onUpdate: (steps: number | null, calories: number | null, source: string) => void
) {
  stopHybrid();

  // 1️⃣ Health Connect primeiro
  try {
    const hc = await getStepsCaloriesActive();
    if (hc && hc.steps !== undefined) {
      onUpdate(hc.steps, hc.activeCalories ?? 0, "healthconnect");
      return { source: "healthconnect" };
    }
  } catch {}

  // 2️⃣ Fallback BLE
  if (!device) {
    onUpdate(null, null, "none");
    return { source: "none" };
  }

  // Primeiro tenta parser ESPECÍFICO DO SEU RELÓGIO
  try {
    const sub = monitorStepsAndCalories(device, (steps, calories) =>
      onUpdate(steps, calories, "ble")
    );
    bleSubs.push(() => sub.remove());
    return { source: "ble", mode: "specific" };
  } catch {}

  // 3️⃣ Se não existir o parser, tenta AUTO-DETECÇÃO
  const candidates = await findNotifyCharacteristics(device);

  for (const c of candidates) {
    const cleanup = monitorRawCharacteristic(
      device,
      c.serviceUUID,
      c.charUUID,
      (raw) => {
        const arr = Buffer.from(raw);

        if (arr.length >= 6) {
          const st = arr[3] + (arr[4] << 8);
          const cal = arr[5];

          if (st >= 0 && st < 100000) {
            onUpdate(st, cal, "ble");
          }
        }
      }
    );

    bleSubs.push(() => cleanup.remove());
  }

  return { source: "ble", mode: "auto" };
}