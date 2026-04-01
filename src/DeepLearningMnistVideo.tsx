import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  CalculateMetadataFunction,
} from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { getAudioDuration } from "./get-audio-duration";

// ── Design tokens ──────────────────────────────────────────
const BG = "#0a0a1a";
const CYAN = "#22d3ee";
const PURPLE = "#a855f7";
const GREEN = "#4ade80";
const ORANGE = "#fb923c";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#94a3b8";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const deepLearningMnistSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof deepLearningMnistSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/deep-learning-mnist/scene-01.mp3",
  "voiceover/deep-learning-mnist/scene-02.mp3",
  "voiceover/deep-learning-mnist/scene-03.mp3",
  "voiceover/deep-learning-mnist/scene-04.mp3",
  "voiceover/deep-learning-mnist/scene-05.mp3",
  "voiceover/deep-learning-mnist/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateDeepLearningMnistMetadata: CalculateMetadataFunction<
  Props
> = async () => {
  const durations = await Promise.all(
    AUDIO_FILES.map((file) => getAudioDuration(staticFile(file)))
  );
  const sceneDurations = durations.map(
    (sec) => Math.ceil(sec * FPS) + PADDING_FRAMES
  );
  return {
    durationInFrames: sceneDurations.reduce((sum, d) => sum + d, 0),
    props: { sceneDurations },
  };
};

// ── Helpers ────────────────────────────────────────────────
const useFade = (fadeIn: number, fadeOut: number, total: number) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, total - fadeOut, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// ── Scene 1: Title ─────────────────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const titleY = interpolate(frame, [fps * 0.3, fps * 1.2], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [fps * 0.3, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [fps * 1, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [fps * 0.8, fps * 1.5], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background neural network nodes
  const nodes = Array.from({ length: 30 }, (_, i) => ({
    x: seededRandom(i * 7 + 1) * 1920,
    y: seededRandom(i * 7 + 2) * 1080,
    r: seededRandom(i * 7 + 3) * 6 + 3,
    delay: seededRandom(i * 7 + 4) * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      {/* Background floating nodes */}
      {nodes.map((n, i) => {
        const pulse = interpolate(
          frame,
          [0, fps * n.delay, fps * (n.delay + 1), fps * (n.delay + 2)],
          [0.1, 0.1, 0.4, 0.1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.r * 2,
              height: n.r * 2,
              borderRadius: "50%",
              backgroundColor: CYAN,
              opacity: pulse,
            }}
          />
        );
      })}

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -2,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          Deep Learningの仕組み
        </div>
        <div
          style={{
            width: lineWidth,
            height: 4,
            background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
            margin: "24px auto",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 42,
            color: CYAN,
            fontFamily: FONT,
            fontWeight: 500,
            opacity: subtitleOpacity,
          }}
        >
          MNISTで学ぶ手書き数字認識
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: What is Deep Learning ─────────────────────────
const WhatIsDLScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  // Mini neural network visualization
  const layers = [3, 5, 5, 3];
  const layerX = [300, 550, 800, 1050];
  const layerColors = [CYAN, PURPLE, PURPLE, GREEN];

  const items = [
    { icon: "🧠", text: "人間の脳の神経回路を模倣", color: CYAN },
    { icon: "📊", text: "多層のニューラルネットワーク", color: PURPLE },
    { icon: "🔍", text: "データからパターンを自動学習", color: GREEN },
    { icon: "⚡", text: "画像認識・言語処理・生成AIに活用", color: ORANGE },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: 80,
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          ニューラルネットワークとは
        </div>

        <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
          {/* Network diagram */}
          <div style={{ position: "relative", width: 1100, height: 500, flexShrink: 0 }}>
            {/* Connections */}
            <svg
              style={{ position: "absolute", width: "100%", height: "100%" }}
              viewBox="0 0 1100 500"
            >
              {layers.map((count, li) => {
                if (li === layers.length - 1) return null;
                const nextCount = layers[li + 1];
                return Array.from({ length: count }, (_, ni) => {
                  const y1 = 250 + (ni - (count - 1) / 2) * 80;
                  return Array.from({ length: nextCount }, (__, nj) => {
                    const y2 = 250 + (nj - (nextCount - 1) / 2) * 80;
                    const connDelay = fps * 0.5 + li * fps * 0.5;
                    const connOpacity = interpolate(
                      frame,
                      [connDelay, connDelay + fps * 0.5],
                      [0, 0.15],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );
                    return (
                      <line
                        key={`${li}-${ni}-${nj}`}
                        x1={layerX[li]}
                        y1={y1}
                        x2={layerX[li + 1]}
                        y2={y2}
                        stroke={layerColors[li]}
                        strokeWidth={1.5}
                        opacity={connOpacity}
                      />
                    );
                  });
                });
              })}
            </svg>

            {/* Nodes */}
            {layers.map((count, li) => {
              const nodeDelay = fps * 0.3 + li * fps * 0.4;
              const nodeOpacity = interpolate(
                frame,
                [nodeDelay, nodeDelay + fps * 0.4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return Array.from({ length: count }, (_, ni) => {
                const y = 250 + (ni - (count - 1) / 2) * 80;
                const pulse = interpolate(
                  frame,
                  [nodeDelay + fps, nodeDelay + fps + fps * 0.3, nodeDelay + fps + fps * 0.6],
                  [1, 1.2, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div
                    key={`${li}-${ni}`}
                    style={{
                      position: "absolute",
                      left: layerX[li] - 18,
                      top: y - 18,
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: layerColors[li],
                      opacity: nodeOpacity,
                      boxShadow: `0 0 20px ${layerColors[li]}`,
                      transform: `scale(${pulse})`,
                    }}
                  />
                );
              });
            })}

            {/* Layer labels */}
            {["入力層", "隠れ層", "隠れ層", "出力層"].map((label, li) => {
              const labelDelay = fps * 0.5 + li * fps * 0.4;
              const labelOpacity = interpolate(
                frame,
                [labelDelay, labelDelay + fps * 0.4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={li}
                  style={{
                    position: "absolute",
                    left: layerX[li] - 40,
                    bottom: 10,
                    width: 80,
                    textAlign: "center",
                    fontSize: 18,
                    color: layerColors[li],
                    fontFamily: FONT,
                    fontWeight: 600,
                    opacity: labelOpacity,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Feature list */}
          <div style={{ flex: 1 }}>
            {items.map((item, i) => {
              const delay = fps * 0.8 + i * fps * 0.6;
              const itemOpacity = interpolate(
                frame,
                [delay, delay + fps * 0.4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const itemX = interpolate(
                frame,
                [delay, delay + fps * 0.4],
                [30, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 28,
                    opacity: itemOpacity,
                    transform: `translateX(${itemX}px)`,
                    backgroundColor: CARD_BG,
                    borderRadius: 14,
                    padding: "16px 24px",
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{item.icon}</span>
                  <div
                    style={{
                      fontSize: 28,
                      color: TEXT_PRIMARY,
                      fontFamily: FONT,
                      fontWeight: 400,
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: MNIST Dataset ─────────────────────────────────
const MnistScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  // Generate a fake "5" digit as a 14x14 grid
  const digitPattern = [
    "00000000000000",
    "00011111111000",
    "00111111111000",
    "00111000000000",
    "00111000000000",
    "00111111110000",
    "00011111111000",
    "00000000111100",
    "00000000011100",
    "00000000011100",
    "00111000111000",
    "00111111111000",
    "00011111110000",
    "00000000000000",
  ];

  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: 80,
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          MNISTデータセット
        </div>

        <div style={{ display: "flex", gap: 80, alignItems: "center", justifyContent: "center" }}>
          {/* Pixel grid visualization */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(14, 32px)",
                gap: 2,
                padding: 16,
                backgroundColor: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                border: `2px solid ${CYAN}30`,
              }}
            >
              {digitPattern.flatMap((row, ri) =>
                row.split("").map((cell, ci) => {
                  const cellDelay =
                    fps * 0.3 + (ri * 14 + ci) * 0.01 * fps * 0.3;
                  const cellOpacity = interpolate(
                    frame,
                    [cellDelay, cellDelay + fps * 0.3],
                    [0, cell === "1" ? 0.9 : 0.08],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: cell === "1" ? CYAN : TEXT_PRIMARY,
                        opacity: cellOpacity,
                      }}
                    />
                  );
                })
              )}
            </div>
            <div
              style={{
                fontSize: 20,
                color: TEXT_SECONDARY,
                fontFamily: FONT,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              28 × 28 ピクセル → 784 値
            </div>
          </div>

          {/* Info panel */}
          <div style={{ maxWidth: 700 }}>
            {[
              { label: "画像数", value: "70,000枚", sub: "訓練60,000 + テスト10,000" },
              { label: "解像度", value: "28 × 28px", sub: "グレースケール（0〜255）" },
              { label: "クラス", value: "10種類", sub: "手書き数字 0〜9" },
              { label: "用途", value: "DL入門の定番", sub: "世界中の研究・教育で使用" },
            ].map((info, i) => {
              const delay = fps * 0.8 + i * fps * 0.5;
              const itemOpacity = interpolate(
                frame,
                [delay, delay + fps * 0.4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 20,
                    marginBottom: 28,
                    opacity: itemOpacity,
                    backgroundColor: CARD_BG,
                    borderRadius: 14,
                    padding: "16px 24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      color: CYAN,
                      fontFamily: FONT,
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  >
                    {info.label}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 32,
                        color: TEXT_PRIMARY,
                        fontFamily: FONT,
                        fontWeight: 600,
                      }}
                    >
                      {info.value}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: TEXT_SECONDARY,
                        fontFamily: FONT,
                      }}
                    >
                      {info.sub}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Digit examples */}
            {(() => {
              const digitsOpacity = interpolate(
                frame,
                [fps * 3, fps * 3.5],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                    opacity: digitsOpacity,
                    justifyContent: "center",
                  }}
                >
                  {digits.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        backgroundColor: CARD_BG,
                        border: `2px solid ${CYAN}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        fontWeight: 700,
                        color: TEXT_PRIMARY,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Network Architecture ──────────────────────────
const ArchitectureScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  // Network: 784 (shown as 8) → 128 (shown as 6) → 64 (shown as 5) → 10 (shown as 4)
  const layers = [
    { count: 8, label: "入力層", sub: "784ニューロン", color: CYAN, x: 200 },
    { count: 6, label: "隠れ層1", sub: "128ニューロン", color: PURPLE, x: 580 },
    { count: 5, label: "隠れ層2", sub: "64ニューロン", color: PURPLE, x: 960 },
    { count: 4, label: "出力層", sub: "10ニューロン", color: GREEN, x: 1340 },
  ];

  // Data flow pulse
  const pulseX = interpolate(
    frame % (fps * 3),
    [0, fps * 3],
    [200, 1340],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Output labels
  const outputLabels = ["0", "1", "...","5", "...", "9"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: 60,
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          ネットワーク構造
        </div>

        <div style={{ position: "relative", width: "100%", height: 650 }}>
          {/* Connections */}
          <svg
            style={{ position: "absolute", width: "100%", height: "100%" }}
            viewBox="0 0 1920 650"
          >
            {layers.map((layer, li) => {
              if (li === layers.length - 1) return null;
              const next = layers[li + 1];
              return Array.from({ length: layer.count }, (_, ni) => {
                const y1 = 300 + (ni - (layer.count - 1) / 2) * 60;
                return Array.from({ length: next.count }, (__, nj) => {
                  const y2 = 300 + (nj - (next.count - 1) / 2) * 60;
                  const connDelay = fps * 0.3 + li * fps * 0.5;
                  const connOpacity = interpolate(
                    frame,
                    [connDelay, connDelay + fps * 0.5],
                    [0, 0.12],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  // Highlight connections near the pulse
                  const midX = (layer.x + next.x) / 2;
                  const dist = Math.abs(pulseX - midX);
                  const highlight = dist < 150 ? 0.3 : 0;
                  return (
                    <line
                      key={`${li}-${ni}-${nj}`}
                      x1={layer.x}
                      y1={y1}
                      x2={next.x}
                      y2={y2}
                      stroke={layer.color}
                      strokeWidth={1.5}
                      opacity={connOpacity + highlight}
                    />
                  );
                });
              });
            })}
          </svg>

          {/* Nodes */}
          {layers.map((layer, li) => {
            const nodeDelay = fps * 0.3 + li * fps * 0.4;
            const nodeOpacity = interpolate(
              frame,
              [nodeDelay, nodeDelay + fps * 0.4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Array.from({ length: layer.count }, (_, ni) => {
              const y = 300 + (ni - (layer.count - 1) / 2) * 60;
              const dist = Math.abs(pulseX - layer.x);
              const glow = dist < 60 ? 1.3 : 1;
              return (
                <div
                  key={`${li}-${ni}`}
                  style={{
                    position: "absolute",
                    left: layer.x - 16,
                    top: y - 16,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: layer.color,
                    opacity: nodeOpacity,
                    boxShadow: `0 0 ${glow > 1 ? 30 : 15}px ${layer.color}`,
                    transform: `scale(${glow})`,
                  }}
                />
              );
            });
          })}

          {/* Layer labels */}
          {layers.map((layer, li) => {
            const labelDelay = fps * 0.5 + li * fps * 0.4;
            const labelOpacity = interpolate(
              frame,
              [labelDelay, labelDelay + fps * 0.4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={li}
                style={{
                  position: "absolute",
                  left: layer.x - 70,
                  bottom: 20,
                  width: 140,
                  textAlign: "center",
                  opacity: labelOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    color: layer.color,
                    fontFamily: FONT,
                    fontWeight: 700,
                  }}
                >
                  {layer.label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                  }}
                >
                  {layer.sub}
                </div>
              </div>
            );
          })}

          {/* Input: pixel image icon */}
          {(() => {
            const imgOpacity = interpolate(
              frame,
              [fps * 0.5, fps * 1],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                style={{
                  position: "absolute",
                  left: 30,
                  top: 250,
                  opacity: imgOpacity,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 16px)",
                    gap: 2,
                    padding: 8,
                    backgroundColor: CARD_BG,
                    borderRadius: 8,
                  }}
                >
                  {"0010000100111110010000100"
                    .split("")
                    .map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 2,
                          backgroundColor: c === "1" ? CYAN : `${CYAN}15`,
                        }}
                      />
                    ))}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    marginTop: 8,
                  }}
                >
                  28×28
                </div>
              </div>
            );
          })()}

          {/* Output labels */}
          {(() => {
            const outOpacity = interpolate(
              frame,
              [fps * 2, fps * 2.5],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                style={{
                  position: "absolute",
                  right: 200,
                  top: 170,
                  opacity: outOpacity,
                }}
              >
                {outputLabels.map((label, i) => {
                  const y = 300 + (i - (outputLabels.length - 1) / 2) * 60 - 170;
                  const isHighlight = label === "5";
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: y - 14,
                        fontSize: isHighlight ? 32 : 24,
                        fontWeight: isHighlight ? 700 : 400,
                        color: isHighlight ? GREEN : TEXT_SECONDARY,
                        fontFamily: FONT,
                      }}
                    >
                      {label === "5" ? "5 → 98.7%" : label}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Arrow indicators */}
          {(() => {
            const arrowOpacity = interpolate(
              frame,
              [fps * 1.5, fps * 2],
              [0, 0.6],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <>
                {[0, 1, 2].map((i) => {
                  const x = (layers[i].x + layers[i + 1].x) / 2;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: x - 12,
                        top: 120,
                        fontSize: 28,
                        color: TEXT_PRIMARY,
                        opacity: arrowOpacity,
                      }}
                    >
                      →
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Training Process ──────────────────────────────
const TrainingScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const steps = [
    {
      num: "1",
      title: "順伝播",
      sub: "Forward Propagation",
      desc: "入力データをネットワークに通し、予測を出力",
      color: CYAN,
      icon: "→",
    },
    {
      num: "2",
      title: "損失計算",
      sub: "Loss Function",
      desc: "予測と正解の誤差を数値化",
      color: ORANGE,
      icon: "△",
    },
    {
      num: "3",
      title: "逆伝播",
      sub: "Backpropagation",
      desc: "誤差の原因を各重みまで追跡",
      color: PURPLE,
      icon: "←",
    },
    {
      num: "4",
      title: "重み更新",
      sub: "Weight Update",
      desc: "勾配降下法で重みを最適化",
      color: GREEN,
      icon: "↻",
    },
  ];

  // Circular flow animation
  const cycleProgress = interpolate(
    frame,
    [fps * 2, duration - fps],
    [0, 3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Loss curve
  const curvePoints = Array.from({ length: 40 }, (_, i) => {
    const x = i * 18;
    const y = 120 * Math.exp(-i * 0.08) + seededRandom(i + 42) * 15;
    return { x, y };
  });

  const curveVisible = interpolate(
    frame,
    [fps * 3, fps * 5],
    [0, 40],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: 80,
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          学習のプロセス
        </div>

        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          {/* 4-step cycle */}
          <div style={{ flex: 1 }}>
            {steps.map((step, i) => {
              const delay = fps * 0.5 + i * fps * 0.7;
              const itemOpacity = interpolate(
                frame,
                [delay, delay + fps * 0.4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const isActive =
                Math.floor(cycleProgress % 4) === i && frame > fps * 2;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    marginBottom: 24,
                    opacity: itemOpacity,
                    backgroundColor: isActive
                      ? `${step.color}15`
                      : CARD_BG,
                    borderRadius: 16,
                    padding: "20px 28px",
                    borderLeft: `4px solid ${step.color}`,
                    transition: "background-color 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      backgroundColor: `${step.color}20`,
                      border: `2px solid ${step.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 800,
                      color: step.color,
                      fontFamily: FONT,
                      flexShrink: 0,
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <div
                        style={{
                          fontSize: 30,
                          color: step.color,
                          fontFamily: FONT,
                          fontWeight: 700,
                        }}
                      >
                        {step.title}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          color: TEXT_SECONDARY,
                          fontFamily: FONT,
                        }}
                      >
                        {step.sub}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        color: TEXT_PRIMARY,
                        fontFamily: FONT,
                        fontWeight: 400,
                        marginTop: 4,
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Repeat arrow */}
            {(() => {
              const repeatOpacity = interpolate(
                frame,
                [fps * 3.5, fps * 4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 24,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    opacity: repeatOpacity,
                    marginTop: 8,
                  }}
                >
                  ↻ このサイクルを数千〜数万回繰り返す
                </div>
              );
            })()}
          </div>

          {/* Loss curve */}
          <div style={{ width: 700, flexShrink: 0 }}>
            <div
              style={{
                fontSize: 24,
                color: TEXT_SECONDARY,
                fontFamily: FONT,
                fontWeight: 600,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              損失（Loss）の推移
            </div>
            <div
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "24px 32px",
                border: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              <svg viewBox="0 0 720 200" style={{ width: "100%", height: 200 }}>
                {/* Axes */}
                <line
                  x1={40}
                  y1={10}
                  x2={40}
                  y2={180}
                  stroke={TEXT_SECONDARY}
                  strokeWidth={1}
                  opacity={0.3}
                />
                <line
                  x1={40}
                  y1={180}
                  x2={710}
                  y2={180}
                  stroke={TEXT_SECONDARY}
                  strokeWidth={1}
                  opacity={0.3}
                />
                {/* Curve */}
                <polyline
                  points={curvePoints
                    .slice(0, Math.floor(curveVisible))
                    .map((p) => `${p.x + 50},${p.y + 30}`)
                    .join(" ")}
                  fill="none"
                  stroke={ORANGE}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Labels */}
                <text
                  x={360}
                  y={198}
                  textAnchor="middle"
                  fill={TEXT_SECONDARY}
                  fontSize={14}
                  fontFamily={FONT}
                >
                  Epoch（学習回数）
                </text>
                <text
                  x={20}
                  y={100}
                  textAnchor="middle"
                  fill={TEXT_SECONDARY}
                  fontSize={14}
                  fontFamily={FONT}
                  transform="rotate(-90, 20, 100)"
                >
                  Loss
                </text>
              </svg>
            </div>

            {/* Accuracy indicator */}
            {(() => {
              const accOpacity = interpolate(
                frame,
                [fps * 5, fps * 5.5],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const accValue = interpolate(
                frame,
                [fps * 5, fps * 6.5],
                [50, 99.2],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 24,
                    opacity: accOpacity,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      color: TEXT_SECONDARY,
                      fontFamily: FONT,
                    }}
                  >
                    最終精度
                  </div>
                  <div
                    style={{
                      fontSize: 64,
                      fontWeight: 800,
                      color: GREEN,
                      fontFamily: FONT,
                    }}
                  >
                    {accValue.toFixed(1)}%
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: Closing ───────────────────────────────────────
const ClosingScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const tagOpacity = interpolate(frame, [fps * 0.8, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const listOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const applications = [
    { text: "画像認識", color: CYAN },
    { text: "自然言語処理", color: PURPLE },
    { text: "音声合成", color: ORANGE },
    { text: "生成AI", color: GREEN },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -1,
            lineHeight: 1.4,
          }}
        >
          MNISTから始まる
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: FONT,
            letterSpacing: -1,
            marginTop: 8,
            background: `linear-gradient(90deg, ${CYAN}, ${PURPLE}, ${GREEN})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          無限の可能性
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
            opacity: tagOpacity,
            justifyContent: "center",
          }}
        >
          {applications.map((app, i) => (
            <div
              key={i}
              style={{
                fontSize: 28,
                color: app.color,
                fontFamily: FONT,
                fontWeight: 600,
                backgroundColor: `${app.color}15`,
                borderRadius: 12,
                padding: "12px 28px",
                border: `1px solid ${app.color}40`,
              }}
            >
              {app.text}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 40,
            opacity: listOpacity,
          }}
        >
          Deep Learning — 手書き数字の先に広がる世界
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const DeepLearningMnistVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [
    TitleScene,
    WhatIsDLScene,
    MnistScene,
    ArchitectureScene,
    TrainingScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/deep-learning-mnist/bgm.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, FPS * 2], [0, 0.12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - FPS * 3, durationInFrames],
            [0.12, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {scenes.map((SceneComp, i) => {
        const from = offset;
        const dur = sceneDurations[i] ?? 180;
        offset += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={15}>
            <SceneComp duration={dur} />
            <Audio src={staticFile(AUDIO_FILES[i])} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
