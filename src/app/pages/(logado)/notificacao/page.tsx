// src/app/pages/(logado)/notificacao/page.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import colors from '@/constants/Colors'

import {
  ensureNotificationPermission,
  scheduleDailyTrainNotification,
  scheduleDailyWaterNotification,
  getScheduledNotifications,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
} from "@/lib/localNotifications";
import { MaterialIcons } from "@expo/vector-icons";

type LocalNotificationKind = "train" | "water";

type ScheduledRequest = Notifications.NotificationRequest;

export default function NotificacaoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ScheduledRequest[]>([]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getScheduledNotifications();
      setList(all);
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureBaseDailyNotifications = useCallback(async () => {
    const all = await getScheduledNotifications();

    const hasTrain = all.some(
      (n) => (n.content.data as any)?.type === ("train" as LocalNotificationKind)
    );
    const hasWater = all.some(
      (n) => (n.content.data as any)?.type === ("water" as LocalNotificationKind)
    );

    if (!hasTrain) {
      await scheduleDailyTrainNotification();
    }
    if (!hasWater) {
      await scheduleDailyWaterNotification();
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        setLoading(false);
        return;
      }

      await ensureBaseDailyNotifications();
      await loadNotifications();
    })();
  }, [ensureBaseDailyNotifications, loadNotifications]);

  const handleCancelOne = async (id: string) => {
    await cancelScheduledNotification(id);
    await loadNotifications();
  };

  const handleCancelAll = async () => {
    await cancelAllScheduledNotifications();
    await loadNotifications();
  };

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.6} onPress={() => router.replace('/pages/(logado)/home/page')}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.darkBlue} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        

        <Text style={styles.sectionTitle}>Lembretes do dispositivo</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0C1F44" />
        ) : list.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma notificação agendada no momento.
          </Text>
        ) : (
          <>
            {list.map((n) => {
              const data = (n.content.data || {}) as { type?: LocalNotificationKind };
              let labelExtra = "";

              if (data.type === "train") labelExtra = " (Treino diário)";
              if (data.type === "water") labelExtra = " (Beber água)";

              return (
                <View key={n.identifier} style={styles.notificationBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationText}>
                      {n.content.title}
                      {labelExtra}
                    </Text>
                    {!!n.content.body && (
                      <Text style={styles.notificationBody}>{n.content.body}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.cancelOneButton}
                    onPress={() => handleCancelOne(n.identifier)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelOneText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.cancelAllButton}
              onPress={handleCancelAll}
              accessibilityRole="button"
            >
              <Text style={styles.cancelAllText}>Cancelar todas</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Dicas e lembretes
        </Text>

        <TouchableOpacity
          style={styles.notificationBox}
          accessibilityRole="button"
          onPress={() => router.push("/pages/(logado)/perfil/page")}
        >
          <Text style={styles.notificationText}>Atualize suas informações!</Text>
          <Text style={styles.arrow} accessibilityLabel="abrir">
            {">"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationBox}
          accessibilityRole="button"
          onPress={() => router.push("/pages/(logado)/home/page")}
        >
          <Text style={styles.notificationText}>
            Não perca tempo! Confira nossas categorias para agendar sua nova
            atividade em grupo!
          </Text>
          <Text style={styles.arrow} accessibilityLabel="abrir">
            {">"}
          </Text>
        </TouchableOpacity>

       
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    alignContent: "center",
    marginBottom: 20
  },

  container: {
    
    paddingHorizontal: 20,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    flex: 1,
    textAlign: "center", 
    fontSize: 20, 
    fontWeight: "bold", 
    color: colors.darkBlue, 
    alignSelf: "center" 
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontWeight: "600",
    fontSize: 15,
    color: "#0C1F44",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  notificationBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#0C1F44",
    marginBottom: 15,
    width: "100%",
  },
  notificationText: {
    fontSize: 14,
    color: "#0C1F44",
    flex: 1,
    paddingRight: 10,
    fontWeight: "600",
  },
  notificationBody: {
    fontSize: 12,
    color: "#0C1F44",
    marginTop: 4,
  },
  arrow: {
    color: "#0C1F44",
    fontSize: 20,
    alignSelf: "center",
  },
  buttonVoltar: {
    marginTop: 40,
    backgroundColor: "#0C1F44",
    borderRadius: 19,
    height: 38,
    width: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelOneButton: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f00",
    marginLeft: 6,
  },
  cancelOneText: {
    fontSize: 11,
    color: "#f00",
    fontWeight: "600",
  },
  cancelAllButton: {
    marginTop: 5,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f00",
  },
  cancelAllText: {
    fontSize: 12,
    color: "#f00",
    fontWeight: "600",
  },
});
