import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Recordatorios de hábitos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(habitId: string, habitName: string, daysDelay: number = 5) {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '¿Recuerdas tu hábito?',
        body: `Has pasado ${daysDelay} días sin completar "${habitName}". ¿Quieres seguir?`,
        data: { habitId, type: 'habit_reminder' },
        ...(Platform.OS === 'android' ? { channelId: 'habit-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: daysDelay * 24 * 60 * 60,
        repeats: false,
      },
    });
    return notificationId;
  } catch (e) {
    console.error('Error scheduling notification:', e);
    return null;
  }
}

export async function cancelHabitReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('Error canceling notification:', e);
  }
}

export async function checkAndSendReminders(habits: any[]) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  for (const habit of habits) {
    const completedDates = habit.completedDates || [];
    const lastActivityValue = completedDates.length > 0
      ? completedDates[completedDates.length - 1]
      : habit.createdAt?.toDate?.() || habit.createdAt;
    if (!lastActivityValue) continue;

    const lastCompleted = new Date(lastActivityValue);
    const diffDays = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 5 || !habit.id) continue;

    const reminderKey = `habit-reminder:${habit.userId || 'current'}:${habit.id}:${today}`;
    if (await AsyncStorage.getItem(reminderKey)) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¿Recuerdas tu hábito?',
          body: `Llevas ${diffDays} días sin completar "${habit.name}".`,
          data: { habitId: habit.id, type: 'habit_reminder' },
          ...(Platform.OS === 'android' ? { channelId: 'habit-reminders' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });
      await AsyncStorage.setItem(reminderKey, 'sent');
    } catch (e) {
      console.error(`Error scheduling reminder for habit ${habit.id}:`, e);
    }
  }
}