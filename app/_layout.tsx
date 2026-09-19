import { Slot, useRouter, useSegments } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, router, segments]);

  useEffect(() => {
    if (!user) return;
    const initializeTutorialSession = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      const sessions = snapshot.data()?.tutorialSessions;
      if (typeof sessions !== 'number') {
        await updateDoc(userRef, { tutorialSessions: 1, tutorialActive: true });
      } else if (sessions < 3) {
        await updateDoc(userRef, { tutorialSessions: sessions + 1, tutorialActive: true });
      } else {
        await updateDoc(userRef, { tutorialActive: false });
      }
    };
    initializeTutorialSession().catch(error => console.error('Error updating tutorial session:', error));
  }, [user]);

  return <Slot />;
}