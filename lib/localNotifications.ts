import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
    const existing = await Notifications.getPermissionsAsync();

    if (existing.status === "granted") {
        return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
}


export async function scheduleDailyTrainNotification() {
    const trigger: Notifications.DailyTriggerInput = {
        hour: 8,
        minute: 0,
        type: Notifications.SchedulableTriggerInputTypes.DAILY
    };

    return Notifications.scheduleNotificationAsync({
        content: {
            title: "Hora de treinar 💪",
            body: "Bora fazer seu treino de hoje?",
            vibrate: [0, 300],
            sound: 'default',
            data: { type: "train" },
        },
        trigger,
    });
}


export async function scheduleDailyWaterNotification() {
    const trigger: Notifications.DailyTriggerInput = {
        hour: 10,
        minute: 0,
        type: Notifications.SchedulableTriggerInputTypes.DAILY
    };

    return Notifications.scheduleNotificationAsync({
        content: {
            title: "Beba água 🚰",
            body: "Faça uma pausa e tome um copo de água.",
            vibrate: [0, 300],
            sound: 'default',
            data: { type: "water" },
        },
        trigger,
    });
}

export async function getScheduledNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelScheduledNotification(id: string) {
    return Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllScheduledNotifications() {
    return Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendTrainConfirmationNotificationOnce() {
  const ok = await ensureNotificationPermission();
  if (!ok) return;

  const all = await Notifications.getAllScheduledNotificationsAsync();
  const already = all.some(
    (n) => n.content?.data?.type === "train_confirm"
  );
  if (already) return;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Treino confirmado com Sucesso! 🎉",
      body: "Sua presença na aula de Hot Yoga Iniciante às 10h foi confirmada.",
      vibrate: [0, 300],
      sound: 'default',
      data: { type: "train_confirm" },
    },
    trigger: null, // dispara imediatamente
  });
}

type TrainingConfirmationParams = {
  trainingKey: string;
  title: string;
  body: string;
};

export async function notifyTrainingConfirmationOnce({
  trainingKey,
  title,
  body,
}: TrainingConfirmationParams) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  try {
    
    await Notifications.cancelScheduledNotificationAsync(trainingKey);
  } catch {}

  await Notifications.scheduleNotificationAsync({
    identifier: trainingKey,
    content: {
      title,
      body,
      vibrate: [0, 300],
      sound: 'default',
      data: {
        type: "training-confirmation",
        trainingKey,
      },
    },
    // null = dispara imediatamente (sem treta de tipo do trigger)
    trigger: null,
  });
}
