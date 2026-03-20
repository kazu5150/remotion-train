import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Seeded random for consistent star positions
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const Star: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
}> = ({ x, y, size, delay, speed }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    ((frame + delay) * speed) % 60,
    [0, 30, 60],
    [0.2, 1, 0.2]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        opacity,
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(150, 180, 255, ${opacity * 0.5})`,
      }}
    />
  );
};

const Nebula: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, 300], [0, 360]);
  const scale = interpolate(frame, [0, 150, 300], [0.8, 1.2, 0.8]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 600,
        height: 600,
        marginTop: -300,
        marginLeft: -300,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, rgba(100, 50, 200, 0.3) 0%, rgba(30, 80, 180, 0.2) 30%, rgba(10, 20, 60, 0.1) 60%, transparent 70%)",
        transform: `rotate(${rotation}deg) scale(${scale})`,
        filter: "blur(20px)",
      }}
    />
  );
};

const Planet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 80, stiffness: 50 },
  });

  const scale = interpolate(enterProgress, [0, 1], [0, 1]);
  const glowPulse = interpolate(frame % 60, [0, 30, 60], [0.5, 1, 0.5]);

  return (
    <div
      style={{
        position: "absolute",
        top: "45%",
        left: "55%",
        width: 200,
        height: 200,
        marginTop: -100,
        marginLeft: -100,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 35%, #4a9eff, #1a3a6a 50%, #0a1628 100%)",
        transform: `scale(${scale})`,
        boxShadow: `0 0 60px 20px rgba(74, 158, 255, ${glowPulse * 0.4}), inset -20px -20px 40px rgba(0,0,0,0.5)`,
      }}
    />
  );
};

const WarpLines: React.FC = () => {
  const frame = useCurrentFrame();

  const lines = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      angle: seededRandom(i) * 360,
      distance: seededRandom(i + 100) * 400 + 200,
      length: seededRandom(i + 200) * 100 + 50,
      width: seededRandom(i + 300) * 2 + 0.5,
    }));
  }, []);

  const warpProgress = interpolate(frame, [200, 270], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (warpProgress === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
      }}
    >
      {lines.map((line, i) => {
        const rad = (line.angle * Math.PI) / 180;
        const currentLength = line.length * warpProgress * 3;
        const x = Math.cos(rad) * line.distance * warpProgress;
        const y = Math.sin(rad) * line.distance * warpProgress;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: currentLength,
              height: line.width,
              backgroundColor: `rgba(180, 210, 255, ${warpProgress * 0.8})`,
              transform: `rotate(${line.angle}deg)`,
              transformOrigin: "0 50%",
              borderRadius: 2,
              boxShadow: `0 0 4px rgba(150, 200, 255, ${warpProgress * 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
};

const Title: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const letterSpacing = interpolate(frame, [20, 80], [30, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glitch = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const fadeOut = interpolate(frame, [250, 280], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "25%",
        width: "100%",
        textAlign: "center",
        opacity: titleOpacity * fadeOut,
        transform: `scale(${0.8 + glitch * 0.2})`,
      }}
    >
      <h1
        style={{
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          fontSize: 72,
          fontWeight: 100,
          color: "#ffffff",
          letterSpacing,
          textTransform: "uppercase",
          textShadow:
            "0 0 20px rgba(100, 180, 255, 0.8), 0 0 60px rgba(80, 140, 255, 0.4)",
          margin: 0,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [80, 110, 250, 270], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame, [80, 110], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "60%",
        width: "100%",
        textAlign: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          fontSize: 28,
          fontWeight: 300,
          color: "rgba(180, 210, 255, 0.9)",
          letterSpacing: 6,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
};

const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();

  const flash = interpolate(frame, [268, 275, 285, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(200, 220, 255, ${flash})`,
        pointerEvents: "none",
      }}
    />
  );
};

export const SpaceVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      x: seededRandom(i * 3) * 100,
      y: seededRandom(i * 3 + 1) * 100,
      size: seededRandom(i * 3 + 2) * 3 + 1,
      delay: seededRandom(i * 5) * 60,
      speed: seededRandom(i * 7) * 0.5 + 0.5,
    }));
  }, []);

  const zoom = interpolate(frame, [0, 300], [1, 1.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030810",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
        }}
      >
        {/* Stars */}
        {stars.map((star, i) => (
          <Star key={i} {...star} />
        ))}

        {/* Nebula */}
        <Nebula />

        {/* Planet */}
        <Sequence from={60}>
          <Planet />
        </Sequence>

        {/* Warp Lines */}
        <WarpLines />
      </div>

      {/* Title */}
      <Title text="The Universe Awaits" />

      {/* Subtitle */}
      <Subtitle text="Beyond the boundaries of space and time" />

      {/* Flash Transition at end */}
      <FlashTransition />
    </AbsoluteFill>
  );
};
