import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Sky gradient that shifts over time
const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 300], [200, 210]);
  const brightness = interpolate(frame, [0, 100, 250, 300], [0.6, 1, 1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: `linear-gradient(
          180deg,
          hsl(${hueShift}, 70%, ${45 * brightness}%) 0%,
          hsl(${hueShift + 10}, 60%, ${65 * brightness}%) 40%,
          hsl(35, 50%, ${85 * brightness}%) 100%
        )`,
      }}
    />
  );
};

// Distant mountain range (background layer)
const MountainRange: React.FC<{
  peaks: { x: number; h: number }[];
  color: string;
  baseY: number;
  parallax: number;
}> = ({ peaks, color, baseY, parallax }) => {
  const frame = useCurrentFrame();
  const offsetX = interpolate(frame, [0, 300], [0, -parallax]);

  const points = peaks
    .map((p) => `${p.x + offsetX},${baseY - p.h}`)
    .join(" ");
  const path = `M-100,${baseY} ${peaks.map((p) => `L${p.x + offsetX},${baseY - p.h}`).join(" ")} L2100,${baseY} Z`;

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0 }}
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
    >
      <path d={path} fill={color} />
    </svg>
  );
};

// Snow caps on the main mountain
const SnowCap: React.FC<{
  cx: number;
  cy: number;
  width: number;
  height: number;
}> = ({ cx, cy, width, height }) => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame % 90, [0, 45, 90], [0.85, 1, 0.85]);

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0 }}
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={width}
        ry={height}
        fill={`rgba(255, 255, 255, ${shimmer})`}
      />
    </svg>
  );
};

// Pine tree
const PineTree: React.FC<{
  x: number;
  y: number;
  scale: number;
  delay: number;
}> = ({ x, y, scale, delay }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + delay) * 0.03) * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale}) rotate(${sway}deg)`,
        transformOrigin: "bottom center",
      }}
    >
      {/* Trunk */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          marginLeft: -4,
          width: 8,
          height: 30,
          backgroundColor: "#5D4037",
          borderRadius: 2,
        }}
      />
      {/* Foliage layers */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 20 + i * 18,
            left: "50%",
            marginLeft: -(20 - i * 4),
            width: 0,
            height: 0,
            borderLeft: `${20 - i * 4}px solid transparent`,
            borderRight: `${20 - i * 4}px solid transparent`,
            borderBottom: `${28 - i * 3}px solid ${i === 0 ? "#2E7D32" : i === 1 ? "#388E3C" : "#43A047"}`,
          }}
        />
      ))}
    </div>
  );
};

// Floating cloud
const Cloud: React.FC<{
  x: number;
  y: number;
  scale: number;
  speed: number;
}> = ({ x, y, scale, speed }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed;
  const opacity = interpolate(frame, [0, 30], [0, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: posX % 2200 - 200,
        top: y,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {[
        { l: 0, t: 10, w: 80, h: 40 },
        { l: 25, t: 0, w: 70, h: 45 },
        { l: 55, t: 8, w: 60, h: 38 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.l,
            top: c.t,
            width: c.w,
            height: c.h,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
          }}
        />
      ))}
    </div>
  );
};

// Flying eagle
const Eagle: React.FC<{ startX: number; y: number; speed: number }> = ({
  startX,
  y,
  speed,
}) => {
  const frame = useCurrentFrame();
  const x = startX + frame * speed;
  const wingAngle = Math.sin(frame * 0.15) * 20;
  const floatY = Math.sin(frame * 0.05) * 15;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        transform: "scale(0.8)",
      }}
    >
      {/* Left wing */}
      <div
        style={{
          position: "absolute",
          left: -20,
          top: 0,
          width: 24,
          height: 3,
          backgroundColor: "#1a1a1a",
          transform: `rotate(${-wingAngle}deg)`,
          transformOrigin: "right center",
          borderRadius: 2,
        }}
      />
      {/* Right wing */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 0,
          width: 24,
          height: 3,
          backgroundColor: "#1a1a1a",
          transform: `rotate(${wingAngle}deg)`,
          transformOrigin: "left center",
          borderRadius: 2,
        }}
      />
      {/* Body */}
      <div
        style={{
          position: "absolute",
          left: -2,
          top: -2,
          width: 12,
          height: 5,
          backgroundColor: "#2a2a2a",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

// Meadow ground with flowers
const Meadow: React.FC = () => {
  const frame = useCurrentFrame();
  const brightness = interpolate(frame, [0, 60], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 200,
        background: `linear-gradient(
          180deg,
          hsl(100, 50%, ${38 * brightness}%) 0%,
          hsl(95, 45%, ${30 * brightness}%) 100%
        )`,
        borderRadius: "50% 50% 0 0 / 30px 30px 0 0",
      }}
    />
  );
};

// Small wildflowers
const Flowers: React.FC = () => {
  const frame = useCurrentFrame();
  const flowers = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: seededRandom(i * 7) * 1920,
        y: 900 + seededRandom(i * 7 + 1) * 150,
        color:
          ["#E91E63", "#FF9800", "#FFEB3B", "#AB47BC", "#EF5350"][
            Math.floor(seededRandom(i * 7 + 2) * 5)
          ],
        size: seededRandom(i * 7 + 3) * 4 + 3,
        delay: seededRandom(i * 7 + 4) * 40,
      })),
    [],
  );

  return (
    <>
      {flowers.map((f, i) => {
        const sway = Math.sin((frame + f.delay) * 0.06) * 3;
        const bloomScale = interpolate(frame, [30 + i * 2, 60 + i * 2], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: f.x,
              top: f.y,
              width: f.size,
              height: f.size,
              borderRadius: "50%",
              backgroundColor: f.color,
              transform: `scale(${bloomScale}) translateX(${sway}px)`,
              boxShadow: `0 0 ${f.size}px ${f.color}40`,
            }}
          />
        );
      })}
    </>
  );
};

// Title text
const AlpsTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({
    frame: frame - 40,
    fps,
    config: { damping: 60, stiffness: 80 },
  });

  const titleOpacity = interpolate(titleIn, [0, 1], [0, 1]);
  const titleY = interpolate(titleIn, [0, 1], [60, 0]);
  const letterSpacing = interpolate(frame, [40, 120], [20, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [240, 280], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "18%",
        width: "100%",
        textAlign: "center",
        opacity: titleOpacity * fadeOut,
        transform: `translateY(${titleY}px)`,
      }}
    >
      <h1
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 90,
          fontWeight: 300,
          color: "#FFFFFF",
          letterSpacing,
          textTransform: "uppercase",
          textShadow:
            "0 2px 20px rgba(0,0,0,0.4), 0 0 60px rgba(100,150,200,0.3)",
          margin: 0,
        }}
      >
        The Alps
      </h1>
    </div>
  );
};

// Subtitle
const AlpsSubtitle: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [90, 120, 240, 270], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame, [90, 120], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        width: "100%",
        textAlign: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32,
          fontWeight: 300,
          fontStyle: "italic",
          color: "rgba(255, 255, 255, 0.9)",
          letterSpacing: 4,
          margin: 0,
          textShadow: "0 1px 10px rgba(0,0,0,0.3)",
        }}
      >
        Where the sky meets the earth
      </p>
    </div>
  );
};

export const AlpsVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Mountain peak data
  const bgMountains = useMemo(
    () => [
      { x: -50, h: 100 },
      { x: 150, h: 250 },
      { x: 350, h: 180 },
      { x: 500, h: 320 },
      { x: 700, h: 200 },
      { x: 900, h: 380 },
      { x: 1100, h: 280 },
      { x: 1300, h: 350 },
      { x: 1500, h: 220 },
      { x: 1700, h: 300 },
      { x: 1920, h: 180 },
      { x: 2050, h: 250 },
    ],
    [],
  );

  const fgMountains = useMemo(
    () => [
      { x: -100, h: 80 },
      { x: 100, h: 200 },
      { x: 300, h: 350 },
      { x: 500, h: 420 },
      { x: 700, h: 380 },
      { x: 960, h: 480 },
      { x: 1200, h: 400 },
      { x: 1400, h: 350 },
      { x: 1600, h: 300 },
      { x: 1800, h: 380 },
      { x: 2000, h: 200 },
      { x: 2100, h: 280 },
    ],
    [],
  );

  const trees = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        x: seededRandom(i * 11) * 1920,
        y: 750 + seededRandom(i * 11 + 1) * 130,
        scale: seededRandom(i * 11 + 2) * 0.8 + 0.6,
        delay: seededRandom(i * 11 + 3) * 100,
      })),
    [],
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: seededRandom(i * 13) * 1800,
        y: 60 + seededRandom(i * 13 + 1) * 200,
        scale: seededRandom(i * 13 + 2) * 0.8 + 0.6,
        speed: seededRandom(i * 13 + 3) * 0.4 + 0.2,
      })),
    [],
  );

  // Slow zoom in
  const zoom = interpolate(frame, [0, 300], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Overall fade in/out
  const fade = interpolate(frame, [0, 30, 270, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a3050", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          opacity: fade,
        }}
      >
        {/* Sky */}
        <Sky />

        {/* Clouds */}
        {clouds.map((c, i) => (
          <Cloud key={i} {...c} />
        ))}

        {/* Eagles */}
        <Sequence from={80}>
          <Eagle startX={-100} y={180} speed={1.8} />
        </Sequence>
        <Sequence from={140}>
          <Eagle startX={-200} y={250} speed={1.4} />
        </Sequence>

        {/* Background mountains */}
        <MountainRange
          peaks={bgMountains}
          color="#7B8FA3"
          baseY={700}
          parallax={20}
        />

        {/* Snow caps on background */}
        <SnowCap cx={900} cy={335} width={60} height={20} />
        <SnowCap cx={1300} cy={365} width={50} height={18} />

        {/* Foreground mountains */}
        <MountainRange
          peaks={fgMountains}
          color="#4A6274"
          baseY={780}
          parallax={40}
        />

        {/* Snow caps on foreground */}
        <SnowCap cx={960} cy={310} width={80} height={25} />
        <SnowCap cx={500} cy={370} width={55} height={18} />
        <SnowCap cx={1400} cy={440} width={50} height={16} />

        {/* Meadow */}
        <Meadow />

        {/* Trees */}
        {trees.map((t, i) => (
          <PineTree key={i} {...t} />
        ))}

        {/* Flowers */}
        <Flowers />
      </div>

      {/* Title */}
      <AlpsTitle />

      {/* Subtitle */}
      <AlpsSubtitle />
    </AbsoluteFill>
  );
};
