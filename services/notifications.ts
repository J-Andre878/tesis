import * as Notifications from 'expo-notifications';

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
      },
      trigger: { seconds: daysDelay * 24 * 60 * 60 },
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
  for (const habit of habits) {
    const completedDates = habit.completedDates || [];
    if (completedDates.length === 0) continue;

    const lastCompleted = new Date(completedDates[completedDates.length - 1]);
    const diffDays = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¿Recuerdas tu hábito?',
          body: `Llevas ${diffDays} días sin completar "${habit.name}".`,
          data: { habitId: habit.id, type: 'habit_reminder' },
        },
        trigger: { seconds: 1 },
      });
    }
  }
}