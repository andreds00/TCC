import { Platform } from "react-native";

let HealthConnect: any = null;
try {
  HealthConnect = require("react-native-health-connect");
} catch (e) {
  console.warn("react-native-health-connect não está disponível (ignorando).");
}

const DEFAULT_RESULT = { steps: 0, activeCalories: 0 };

export async function getStepsCaloriesActive() {
  try {
    if (Platform.OS !== "android") return DEFAULT_RESULT;
    if (!HealthConnect) return DEFAULT_RESULT;

    const { initialize, readRecords, getGrantedPermissions } = HealthConnect;

    if (!initialize || !readRecords) return DEFAULT_RESULT;

    const isInitialized = await initialize().catch(() => null);
    if (!isInitialized) return DEFAULT_RESULT;

    let hasStepsPermission = true;
    let hasCaloriesPermission = true;

    if (typeof getGrantedPermissions === "function") {
      const granted = await getGrantedPermissions().catch(() => []);
      if (Array.isArray(granted)) {
        hasStepsPermission = granted.some(
          (p: any) => p.recordType === "Steps" && p.accessType === "read"
        );
        hasCaloriesPermission = granted.some(
          (p: any) =>
            p.recordType === "ActiveCaloriesBurned" && p.accessType === "read"
        );
      }
    }

    if (!hasStepsPermission && !hasCaloriesPermission) {
      return DEFAULT_RESULT;
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let steps = 0;
    if (hasStepsPermission) {
      const stepsResult = await readRecords("Steps", {
        timeRangeFilter: { operator: "between", startTime, endTime },
      }).catch(() => ({ records: [] }));

      steps =
        stepsResult.records?.reduce(
          (sum: number, r: any) => sum + (r.count ?? 0),
          0
        ) ?? 0;
    }

    let activeCalories = 0;
    if (hasCaloriesPermission) {
      const caloriesResult = await readRecords("ActiveCaloriesBurned", {
        timeRangeFilter: { operator: "between", startTime, endTime },
      }).catch(() => ({ records: [] }));

      activeCalories =
        caloriesResult.records?.reduce(
          (sum: number, r: any) => sum + (r.energy?.inKilocalories ?? 0),
          0
        ) ?? 0;
    }

    return { steps, activeCalories };
  } catch {
    return DEFAULT_RESULT;
  }
}
