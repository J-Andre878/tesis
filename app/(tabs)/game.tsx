import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { useUser } from '../../hooks/useUser';

const { width, height } = Dimensions.get('window');

const STARS_PER_CONSTELLATION = 7;

const CONSTELLATIONS = [
  {
    name: 'Orión',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.65, y: 0.28 },
      { x: 0.55, y: 0.42 },
      { x: 0.5, y: 0.45 },
      { x: 0.45, y: 0.42 },
      { x: 0.35, y: 0.28 },
      { x: 0.5, y: 0.72 },
    ],
    lines: [[0,1],[0,5],[1,2],[5,4],[2,3],[3,4],[2,6],[4,6]],
    colors: ['#050510', '#0a0520', '#080318', '#050510'] as any,
  },
  {
    name: 'Osa Mayor',
    stars: [
      { x: 0.2, y: 0.55 },
      { x: 0.32, y: 0.48 },
      { x: 0.44, y: 0.44 },
      { x: 0.54, y: 0.5 },
      { x: 0.62, y: 0.35 },
      { x: 0.72, y: 0.25 },
      { x: 0.8, y: 0.18 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
    colors: ['#020810', '#050f1a', '#030c18', '#020810'] as any,
  },
  {
    name: 'Casiopea',
    stars: [
      { x: 0.18, y: 0.5 },
      { x: 0.32, y: 0.3 },
      { x: 0.5, y: 0.45 },
      { x: 0.68, y: 0.3 },
      { x: 0.82, y: 0.5 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
    colors: ['#100510', '#1a0820', '#120618', '#100510'] as any,
  },
  {
    name: 'Cruz del Sur',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.85 },
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 },
      { x: 0.38, y: 0.72 },
    ],
    lines: [[0,1],[2,3],[0,4]],
    colors: ['#021008', '#030f08', '#021008', '#010805'] as any,
  },
  {
    name: 'Escorpio',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.55, y: 0.25 },
      { x: 0.52, y: 0.35 },
      { x: 0.45, y: 0.45 },
      { x: 0.4, y: 0.55 },
      { x: 0.45, y: 0.65 },
      { x: 0.55, y: 0.72 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
    colors: ['#100a02', '#1a1002', '#120c02', '#100a02'] as any,
  },
];

function AnimatedStarShape({ x, y, size, opacity, delay, duration }: any) {
  const twinkleOpacity = useRef(new Animated.Value(opacity)).current;
  const center = size * 2;
  const s = size;
  const points = [
    `${center},${center - s}`,
    `${center + s * 0.25},${center - s * 0.25}`,
    `${center + s},${center}`,
    `${center + s * 0.25},${center + s * 0.25}`,
    `${center},${center + s}`,
    `${center - s * 0.25},${center + s * 0.25}`,
    `${center - s},${center}`,
    `${center - s * 0.25},${center - s * 0.25}`,
  ].join(' ');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleOpacity, { toValue: opacity * 0.15, duration, useNativeDriver: true, delay }),
        Animated.timing(twinkleOpacity, { toValue: opacity, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, opacity, twinkleOpacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - center,
        top: y - center,
        width: center * 2,
        height: center * 2,
        opacity: twinkleOpacity,
      }}
    >
      <Svg width={center * 2} height={center * 2}>
        <Circle cx={center} cy={center} r={size * 2} fill="#ffffff" opacity={0.12} />
        <Polygon points={points} fill="#ffffff" />
      </Svg>
    </Animated.View>
  );
}

function PulsingConstellationStar({ x, y, index }: any) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const delay = index * 300;
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.5, duration: 2000, useNativeDriver: true, delay }),
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true, delay }),
      Animated.timing(glow, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - 14, top: y - 14,
      width: 28, height: 28,
      alignItems: 'center', justifyContent: 'center',
      transform: [{ scale: pulse }],
    }}>
      <Animated.View style={{
        position: 'absolute',
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#fff', opacity: glow,
        transform: [{ scale: 1.5 }],
      }} />
      <View style={styles.constellationDot} />
    </Animated.View>
  );
}

export default function GameScreen() {
  const { userData } = useUser();
  const [fullscreen, setFullscreen] = useState(false);

  const constellationStars = userData?.constellationStars || 0;
  const smallStars = userData?.smallStars || 0;

  let constIndex = 0;
  let starsInCurrent = constellationStars;
  while (constIndex < CONSTELLATIONS.length - 1 && starsInCurrent >= STARS_PER_CONSTELLATION) {
    starsInCurrent -= STARS_PER_CONSTELLATION;
    constIndex++;
  }

  const currentConst = CONSTELLATIONS[constIndex];
  const svgW = width * 0.88;
  const svgH = height * 0.38;

  const smallStarPositions = useMemo(() =>
    Array.from({ length: Math.min(smallStars, 500) }, (_, i) => ({
      x: ((Math.sin(i * 127.1 + 1.5) * 0.5 + 0.5)) * width,
      y: ((Math.sin(i * 311.7 + 2.3) * 0.5 + 0.5)) * height,
      size: 1.2 + (i % 3) * 0.4,
      opacity: 0.4 + (i % 5) * 0.1,
      delay: i * 237,
      duration: 1800 + (i % 7) * 400,
    })),
  [smallStars]);

  const starsNeeded = STARS_PER_CONSTELLATION - starsInCurrent;
  const progressPercent = (starsInCurrent / STARS_PER_CONSTELLATION) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentConst.colors} style={StyleSheet.absoluteFill} />

      {/* Estrellas pequeñas ganadas */}
      {smallStars > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {smallStarPositions.map((star, i) => (
            <AnimatedStarShape key={i} {...star} />
          ))}
        </View>
      )}

      {!fullscreen && (
        <View style={styles.content}>
          <Text style={styles.title}>Tu Cielo</Text>
          <Text style={styles.subtitle}>
            {starsInCurrent} / {STARS_PER_CONSTELLATION} estrellas · {currentConst.name}
          </Text>
        </View>
      )}

      {/* Constelación centrada */}
      <View style={[styles.constellationWrapper, fullscreen && styles.constellationWrapperFull]}>
        <Svg width={svgW} height={svgH}>
          {currentConst.lines.map(([a, b], i) => {
            if (a >= starsInCurrent || b >= starsInCurrent) return null;
            const sA = currentConst.stars[a];
            const sB = currentConst.stars[b];
            return (
              <Line
                key={i}
                x1={sA.x * svgW} y1={sA.y * svgH}
                x2={sB.x * svgW} y2={sB.y * svgH}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
            );
          })}

        </Svg>

        <View style={StyleSheet.absoluteFill}>
          {currentConst.stars.map((star, i) => {
            if (i >= starsInCurrent) return null;
            return (
              <PulsingConstellationStar
                key={`pulse-${i}`}
                x={star.x * svgW}
                y={star.y * svgH}
                index={i}
              />
            );
          })}
        </View>
      </View>

      {!fullscreen && (
        <View style={styles.infoContainer}>
          {starsInCurrent >= STARS_PER_CONSTELLATION ? (
            <Text style={styles.completeText}>¡Constelación completada! 🌌</Text>
          ) : (
            <>
              <Text style={styles.nextStarText}>
                Faltan <Text style={styles.highlight}>{starsNeeded} semanas perfectas</Text> para completar esta constelación
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </>
          )}
          <Text style={styles.smallStarsText}>⭐ {smallStars} estrellas de constancia diaria</Text>
        </View>
      )}

      {/* Botón fullscreen */}
      <TouchableOpacity
        style={styles.fullscreenBtn}
        onPress={() => setFullscreen(!fullscreen)}
      >
        <Text style={styles.fullscreenIcon}>{fullscreen ? '✕' : '⛶'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', paddingTop: 65 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  constellationWrapper: { position: 'absolute', top: height * 0.22, left: width * 0.06 },
  constellationWrapperFull: { top: height * 0.1 },
  constellationDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },
  infoContainer: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32 },
  nextStarText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  highlight: { color: '#fff', fontWeight: 'bold' },
  progressBar: { width: width * 0.55, height: 3, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 },
  smallStarsText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  completeText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  fullscreenBtn: { position: 'absolute', top: 55, right: 20, padding: 8 },
  fullscreenIcon: { fontSize: 22, color: 'rgba(255,255,255,0.5)' },
});