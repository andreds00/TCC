import { Platform } from "react-native";

// Tentativa de carregar a lib sem quebrar a aplicação
let HealthConnect: any = null;
try {
  HealthConnect = require("react-native-health-connect");
} catch (e) {
  console.warn("⚠ react-native-health-connect não está disponível (ignorando).");
}

const DEFAULT_RESULT = { steps: 0, activeCalories: 0 };

export async function getStepsCaloriesActive() {
  try {
    // Verifica plataforma
    if (Platform.OS !== "android") {
      return DEFAULT_RESULT;
    }

    // Verifica se a lib existe
    if (!HealthConnect) {
      return DEFAULT_RESULT;
    }

    const { initialize, requestPermission, readRecords } = HealthConnect;

    console.log("🔄 Tentando inicializar Health Connect...");
    const ok = await initialize().catch(() => null);

    if (!ok) {
      console.warn("⚠ Health Connect não iniciou (ignorando erro).");
      return DEFAULT_RESULT;
    }

    console.log("🔐 Solicitando permissões...");
    await requestPermission([
      { accessType: "read", recordType: "Steps" },
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
    ]).catch(() => null);

    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // ---- PASSOS ----
    const stepsResult = await readRecords("Steps", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    }).catch(() => ({ records: [] }));

    const steps = stepsResult.records?.reduce(
      (sum: number, r: any) => sum + (r.count ?? 0),
      0
    ) ?? 0;

    // ---- CALORIAS ----
    const caloriesResult = await readRecords("ActiveCaloriesBurned", {
      timeRangeFilter: { operator: "between", startTime, endTime },
    }).catch(() => ({ records: [] }));

    const activeCalories = caloriesResult.records?.reduce(
      (sum: number, r: any) => sum + (r.energy?.inKilocalories ?? 0),
      0
    ) ?? 0;

    return { steps, activeCalories };

  } catch (e) {
    // 🔥 Nunca mais quebra o app
    return DEFAULT_RESULT;
  }
}
