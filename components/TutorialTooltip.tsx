import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TutorialTooltipProps {
  text: string;
  onDismiss: () => void;
  position?: 'top' | 'center' | 'bottom';
}

export function TutorialTooltip({ text, onDismiss, position = 'center' }: TutorialTooltipProps) {
  return (
    <View style={[styles.overlay, position === 'top' ? styles.top : position === 'bottom' ? styles.bottom : styles.center]}>
      <View style={styles.card}>
        <Text style={styles.text}>{text}</Text>
        <TouchableOpacity style={styles.button} onPress={onDismiss}>
          <Text style={styles.buttonText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20, justifyContent: 'center', padding: 24 },
  top: { justifyContent: 'flex-start', paddingTop: 120 },
  bottom: { justifyContent: 'flex-end', paddingBottom: 110 },
  center: { justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  text: { color: '#333', fontSize: 15, lineHeight: 21 },
  button: { alignSelf: 'flex-end', marginTop: 14, backgroundColor: '#6C63FF', borderRadius: 9, paddingHorizontal: 16, paddingVertical: 9 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
