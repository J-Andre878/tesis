import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../contexts/ThemeContext';
import { checkAndSendReminders, requestNotificationPermission } from '../../services/notifications';
import { useHabits } from '../../hooks/useHabits';
import { useEffect, useRef } from 'react';

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const { habits, loading } = useHabits();
  const notificationsInitialized = useRef(false);

  useEffect(() => {
    if (loading || notificationsInitialized.current) return;
    notificationsInitialized.current = true;

    const initializeNotifications = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await checkAndSendReminders(habits);
      }
    };

    initializeNotifications().catch(error => {
      console.error('Error initializing habit reminders:', error);
    });
  }, [habits, loading]);

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.mutedText,
      tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habitos',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Juego',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}