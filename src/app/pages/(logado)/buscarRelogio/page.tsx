import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  PermissionsAndroid,
  Switch,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Device } from "react-native-ble-plx";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";

import colors from "@/constants/Colors";
import { router, useFocusEffect } from "expo-router";
import BubbleScanner from "@/src/app/components/BubbleScanner";
import { getStepsCaloriesActive } from "@/lib/healthConnect";

// FUNÇÃO QUE LÊ QUALQUER CHARACTERISTIC (RAW)
import { monitorRawCharacteristic, isBleAvailable, getManager } from "@/lib/bluetooth";

let persistentDevice: Device | null = null;
const setPersistentDevice = (d: Device | null) => (persistentDevice = d);
const getPersistentDevice = () => persistentDevice;

// FILTRO DE MARCAS
const WATCH_BRANDS = [
  "Apple",
  "Samsung",
  "Huawei",
  "Galaxy",
  "Fitbit",
  "Garmin",
  "Xiaomi",
  "Haylou",
  "WearOS",
  "Amazfit",
  "Mi Band",
  "Mormaii",
];

export default function MeusTreinos() {
  const bleSupported = isBleAvailable();
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(
    getPersistentDevice()
  );
  const [persistConnection, setPersistConnection] = useState<boolean>(
    !!getPersistentDevice()
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "disconnected" | "error"
  >("idle");
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  const [healthConnected, setHealthConnected] = useState(false);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [sourcesSimulated, setSourcesSimulated] = useState<any[]>([]);

  // ================= PERMISSÕES ANDROID =================
  const requestPermissions = async () => {
    if (!bleSupported) {
      Alert.alert(
        "Bluetooth indisponível",
        "Este build não possui suporte ao módulo react-native-ble-plx. Instale o app através de um build nativo ou dev client."
      );
      return false;
    }

    if (Platform.OS !== "android") return true;

    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const denied = Object.values(results).some(
        (v) => v !== PermissionsAndroid.RESULTS.GRANTED
      );

      if (denied) {
        Alert.alert(
          "Permissões necessárias",
          "Ative Bluetooth e Localização para continuar."
        );
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  // ================= CONECTAR AO RELÓGIO =================
  const connectDevice = async (device: Device) => {
    try {
      setConnectionStatus("connecting");
      setConnectingDeviceId(device.id);

      const manager = getManager();
      await manager.stopDeviceScan();
      setScanning(false);

      const conn = await manager.connectToDevice(device.id);
      await conn.discoverAllServicesAndCharacteristics();

      // DEBUG → lista services/characteristics
      try {
        const services = await conn.services();
        for (const service of services) {
          console.log("SERVICE:", service.uuid);

          const characteristics = await service.characteristics();
          for (const c of characteristics) {
            console.log(
              "  CHARACTERISTIC:",
              c.uuid,
              "| READ:", c.isReadable,
              "| WRITE:", c.isWritableWithResponse || c.isWritableWithoutResponse,
              "| NOTIFY:", c.isNotifiable
            );
          }
        }
      } catch (err) {
        console.log("Erro ao listar services:", err);
      }

      // =====================================================
      // 🔥 MONITORAR PASSOS E CALORIAS AUTOMATICAMENTE
      // =====================================================

      try {
        monitorRawCharacteristic(
          conn,
          "00006006-0000-1000-8000-00805f9b34fb",
          "00008004-0000-1000-8000-00805f9b34fb",
          (raw) => {
            try {
              const bytes = Buffer.from(raw);      // sempre converte corretamente
              const arr = new Uint8Array(bytes);   // Uint8Array garantido


              // ---- DECODIFICAÇÃO UNIVERSAL OEM ----
              const stepsValue = arr[3] + (arr[4] << 8);
              const caloriesValue = arr[5];

              setSteps(stepsValue);
              setCalories(caloriesValue);

              console.log("📥 PASSOS:", stepsValue, "🔥 CALORIAS:", caloriesValue);
            } catch (err) {
              console.log("Erro parse 8004:", err);
            }
          }
        );
      } catch (err) {
        console.log("Erro monitor 8004:", err);
      }

      // Outras characteristics (opcional)
      try {
        monitorRawCharacteristic(
          conn,
          "00006006-0000-1000-8000-00805f9b34fb",
          "00008002-0000-1000-8000-00805f9b34fb",
          (raw) => console.log("DATA 8002:", raw)
        );
      } catch { }

      try {
        monitorRawCharacteristic(
          conn,
          "00001530-0000-1000-8000-00805f9b34fb",
          "00001531-0000-1000-8000-00805f9b34fb",
          (raw) => console.log("DATA 1531:", raw)
        );
      } catch { }

      // =====================================================

      setConnectedDevice(conn);
      setConnectionStatus("connected");
      setConnectingDeviceId(null);

    } catch (err) {
      console.log("Error connect:", err);
      setConnectingDeviceId(null);
      setConnectionStatus("error");
      Alert.alert("Erro", "Não foi possível conectar ao dispositivo.");
    }
  };

  // ================= DESCONECTAR =================
  const disconnectDevice = async () => {
    try {
      const dev = connectedDevice || getPersistentDevice();
      if (!dev) return;

      const manager = getManager();
      await manager.cancelDeviceConnection(dev.id);
      manager.stopDeviceScan();

      setConnectedDevice(null);
      setPersistentDevice(null);
      setConnectionStatus("disconnected");
    } catch {
      setConnectionStatus("error");
    }
  };

  // ================= SCAN =================
  const startScan = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    setDevices([]);
    setScanning(true);

    if (!bleSupported) return;

    const manager = getManager();
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        if (error.message.includes("powered off")) {
          Alert.alert(
            "Bluetooth Desligado",
            "Ligue o Bluetooth para procurar dispositivos.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Abrir Configurações",
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        } else {
          console.warn("Erro scan BLE:", error);
        }
        setScanning(false);
        return;
      }

      try {
        if (
          device &&
          WATCH_BRANDS.some((brand) =>
            (device.name || "").toLowerCase().includes(brand.toLowerCase())
          )
        ) {
          setDevices((prev) => {
            if (prev.find((d) => d.id === device.id)) return prev;
            return [...prev, device];
          });
        }
      } catch { }
    });

    setTimeout(() => {
      const manager = getManager();
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  // ================= HEALTH CONNECT =================
  const loadHealthConnect = async () => {
    if (Platform.OS !== "android") {
      setHealthConnected(false);
      return;
    }

    setLoadingHealth(true);
    try {
      const data = await getStepsCaloriesActive();
      const stepCount = data?.steps ?? 0;
      const activeCalories = data?.activeCalories ?? 0;

      if (data !== null && data !== undefined) {
        setSteps(stepCount);
        setCalories(activeCalories);
        setHealthConnected(true);

        setSourcesSimulated([
          { name: "Google Fit", detected: stepCount > 0 },
          { name: "Samsung Health", detected: false },
          { name: "Fitbit", detected: false },
          { name: "Amazfit / Zepp", detected: false },
          { name: "WearOS", detected: stepCount > 0 },
        ]);
      } else {
        setHealthConnected(false);
        setSourcesSimulated([]);
      }
    } catch {
      setHealthConnected(false);
      setSourcesSimulated([]);
    } finally {
      setLoadingHealth(false);
    }
  };

  // ================= INICIALIZAÇÃO =================
  useEffect(() => {
    if (!bleSupported) {
      setConnectionStatus("error");
      return;
    }

    if (Platform.OS === "android") {
      activateKeepAwakeAsync().catch(() => { });
    }

    const persisted = getPersistentDevice();
    if (persisted) {
      setConnectedDevice(persisted);
      setConnectionStatus("connected");
      setDevices([persisted]);
    } else {
      startScan();
    }

    loadHealthConnect();

    return () => {
      if (Platform.OS === "android") {
        deactivateKeepAwake().catch(() => { });
      }
      if (bleSupported) {
        const manager = getManager();
      manager.stopDeviceScan();
      }
    };
  }, [bleSupported]);

  useEffect(() => {
    if (connectedDevice) {
      setDevices((prev) => {
        if (prev.find((d) => d.id === connectedDevice.id)) return prev;
        return [...prev, connectedDevice];
      });
    }
  }, [connectedDevice]);

  useFocusEffect(
    useCallback(() => {
      try {
        const persisted = getPersistentDevice();
        if (persisted) {
          setConnectedDevice(persisted);
          setConnectionStatus("connected");

          setDevices((prev) => {
            if (prev.find((d) => d.id === persisted.id)) return prev;
            return [persisted, ...prev];
          });
        }
      } catch { }
    }, [])
  );

  const filteredDevices = React.useMemo(() => {
    try {
      const deviceMap = new Map<string, Device>();

      devices.forEach((d) => {
        if (!d) return;

        if (
          connectedDevice?.id === d.id ||
          (d.name &&
            WATCH_BRANDS.some((b) => d.name!.toLowerCase().includes(b.toLowerCase())))
        ) {
          deviceMap.set(d.id, d);
        }
      });

      if (connectedDevice && !deviceMap.has(connectedDevice.id)) {
        deviceMap.set(connectedDevice.id, connectedDevice);
      }

      return Array.from(deviceMap.values());
    } catch {
      return [];
    }
  }, [devices, connectedDevice]);

  const renderDevice = ({ item }: { item: Device }) => {
    const isConnected = connectedDevice?.id === item.id;

    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => {
          if (isConnected) disconnectDevice();
          else connectDevice(item);
        }}
      >
        <Text style={styles.deviceName}>{item.name || "Relógio BLE"}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>

        {connectingDeviceId === item.id && (
          <Text style={{ color: "#ff9900", marginTop: 5 }}>Conectando...</Text>
        )}

        {isConnected && (
          <Text style={{ color: "green", marginTop: 5 }}>✔ Conectado</Text>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/pages/(logado)/home/page")}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.title}>Conectar Relógio</Text>
      </View>

      <View style={styles.containerSubtitle}>
        <Text style={styles.subtitle}>Procurando dispositivos próximos…</Text>
        <BubbleScanner active={scanning} />

        {connectionStatus === "connecting" && (
          <Text style={styles.statusConnecting}>🔄 Conectando...</Text>
        )}

        {connectionStatus === "connected" && (
          <Text style={styles.statusConnected}>🟢 Conectado!</Text>
        )}

        {connectionStatus === "disconnected" && (
          <Text style={styles.statusDisconnected}>🔴 Dispositivo desconectado</Text>
        )}

        {connectionStatus === "error" && (
          <Text style={styles.statusDisconnected}>⚠ Erro ao conectar</Text>
        )}

        <Text style={{ marginTop: 10, color: colors.darkGray }}>
          {scanning ? "Buscando..." : "Busca finalizada"}
        </Text>
      </View>

      <Text style={styles.subtitleList}>Dispositivos Bluetooth:</Text>
    </>
  );

  const ListFooter = () => (
    <>
      <View style={styles.persistentBox}>
        <Text style={styles.persistentText}>Manter conectado ao trocar de tela</Text>
        <Switch value={persistConnection} onValueChange={setPersistConnection} />
      </View>

      {connectedDevice && (
        <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectDevice}>
          <Text style={{ color: "red", fontWeight: "600" }}>Desconectar</Text>
        </TouchableOpacity>
      )}

      {/* BLOCO DO HEALTH CONNECT */}
      <View style={styles.healthBox}>
        <Text style={styles.subtitleList}>Health Connect</Text>

        {loadingHealth ? (
          <ActivityIndicator size="large" color={colors.darkBlue} />
        ) : healthConnected ? (
          <>
            <Text style={styles.healthText}>Passos hoje: {steps }</Text>
            <Text style={styles.healthText}>Calorias ativas: {calories} kcal</Text>

            <TouchableOpacity
              onPress={() =>
                Linking.openURL("android-app://com.google.android.apps.healthdata")
              }
              style={styles.openButton}
            >
              <Text style={styles.openButtonText}>Abrir Health Connect</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.healthText}>❌ Não conectado ao Health Connect</Text>
            <Text
              style={{
                fontSize: 12,
                marginTop: 8,
                color: colors.darkGray,
              }}
            >
              Certifique-se de estar usando um build nativo Android (não Expo Go)
            </Text>

            <TouchableOpacity
              onPress={loadHealthConnect}
              style={[styles.openButton, { marginTop: 12, backgroundColor: colors.darkBlue }]}
            >
              <Text style={styles.openButtonText}>🔄 Tentar Conectar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.btnScan} onPress={startScan}>
        <Text style={styles.btnScanText}> Buscar novamente</Text>
      </TouchableOpacity>
    </>
  );

  if (!bleSupported) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: colors.darkBlue, textAlign: "center", marginBottom: 12 }}>
          Bluetooth indisponível neste build
        </Text>
        <Text style={{ color: colors.darkGray, textAlign: "center" }}>
          Para usar a busca de relógios é necessário instalar o app via build nativo (expo run / EAS) ou um Dev Client com o módulo react-native-ble-plx.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={() => (
            <Text style={{ color: colors.darkGray, marginBottom: 16 }}>
              Nenhum relógio encontrado até o momento.
            </Text>
          )}
          contentContainerStyle={styles.scrollContainer}
          style={styles.container}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 30, paddingVertical: 10 },
  title: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "bold", color: colors.darkBlue },
  containerSubtitle: { height: 280, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 16, color: colors.darkGray },
  statusConnecting: { color: "#ff9900", marginTop: 10, fontWeight: "600" },
  statusConnected: { color: "green", marginTop: 10, fontWeight: "600" },
  statusDisconnected: { color: "red", marginTop: 10, fontWeight: "600" },
  subtitleList: { fontSize: 18, color: colors.darkBlue, fontWeight: "600", marginBottom: 10 },
  deviceItem: { padding: 12, backgroundColor: "#f0f4ff", borderRadius: 10, marginBottom: 8 },
  deviceName: { fontSize: 16, fontWeight: "600", color: colors.darkBlue },
  deviceId: { fontSize: 12, color: colors.darkGray },
  persistentBox: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  persistentText: { fontSize: 15, color: colors.darkBlue },
  disconnectBtn: { backgroundColor: "#ffdede", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  healthBox: { marginTop: 20, padding: 15, backgroundColor: "#e5f7ff", borderRadius: 10 },
  healthText: { fontSize: 15, color: colors.darkBlue, marginTop: 4 },
  openButton: { marginTop: 12, backgroundColor: "#1A73E8", padding: 10, borderRadius: 8, alignItems: "center" },
  openButtonText: { color: "white", fontWeight: "600" },
  btnScan: { marginTop: 20, backgroundColor: colors.darkBlue, padding: 14, borderRadius: 12, alignItems: "center" },
  btnScanText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
