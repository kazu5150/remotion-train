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
const BG = "#0c1222";
const GOLD = "#f5c542";
const WARM = "#e8a045";
const SKY = "#5eadd6";
const GREEN = "#5db87a";
const ROSE = "#e06080";
const TEXT_PRIMARY = "#f0ead6";
const TEXT_SECONDARY = "#8899aa";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "Georgia, 'Noto Serif JP', serif";
const FONT_SANS = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const doorIntoSummerSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof doorIntoSummerSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/door-into-summer/scene-01.mp3",
  "voiceover/door-into-summer/scene-02.mp3",
  "voiceover/door-into-summer/scene-03.mp3",
  "voiceover/door-into-summer/scene-04.mp3",
  "voiceover/door-into-summer/scene-05.mp3",
  "voiceover/door-into-summer/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateDoorIntoSummerMetadata: CalculateMetadataFunction<
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

// ── Scene 1: Title ─────────────────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const catOpacity = interpolate(frame, [fps * 0.2, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [fps * 0.6, fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [fps * 0.6, fps * 1.3], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [fps * 1, fps * 1.8], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorOpacity = interpolate(frame, [fps * 1.3, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yearOpacity = interpolate(frame, [fps * 1.8, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* Cat silhouette emoji */}
      <div style={{ fontSize: 80, opacity: catOpacity, marginBottom: 24 }}>
        🐈
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: GOLD,
          fontFamily: FONT,
          letterSpacing: 4,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          textShadow: `0 0 40px ${GOLD}40`,
        }}
      >
        夏への扉
      </div>

      {/* English title */}
      <div
        style={{
          fontSize: 28,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          fontStyle: "italic",
          opacity: titleOpacity,
          marginTop: 8,
        }}
      >
        The Door into Summer
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          marginTop: 24,
        }}
      />

      {/* Author */}
      <div
        style={{
          fontSize: 36,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          marginTop: 28,
          opacity: authorOpacity,
        }}
      >
        ロバート・A・ハインライン
      </div>

      {/* Year */}
      <div
        style={{
          fontSize: 22,
          color: TEXT_SECONDARY,
          fontFamily: FONT_SANS,
          marginTop: 12,
          opacity: yearOpacity,
          letterSpacing: 4,
        }}
      >
        1956
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: The Fall ──────────────────────────────────────
const FallScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { icon: "🤖", label: "発明", text: "万能家事ロボット「文化少女ハイヤードガール」を開発", color: SKY },
    { icon: "🤝", label: "パートナー", text: "マイルズとベルに会社を乗っ取られる", color: ROSE },
    { icon: "💔", label: "裏切り", text: "婚約者とパートナーの共謀で全てを失う", color: ROSE },
    { icon: "🐈", label: "残されたもの", text: "愛猫ピートだけが、ダンの味方だった", color: GOLD },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 22,
            color: SKY,
            fontFamily: FONT_SANS,
            fontWeight: 600,
            letterSpacing: 6,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          1970年 ロサンゼルス
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          すべてを失ったエンジニア
        </div>

        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.6;
          const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [delay, delay + fps * 0.4], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 24,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "20px 28px",
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <span style={{ fontSize: 40, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 22, color: item.color, fontFamily: FONT_SANS, fontWeight: 700 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400 }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Cold Sleep & Future ───────────────────────────
const FutureScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const arrowProgress = interpolate(frame, [fps * 0.5, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const discoveries = [
    { text: "特許はすべて盗まれていた", color: ROSE },
    { text: "愛猫ピートも冷凍睡眠に", color: GOLD },
    { text: "少女リッキーが待ち続けていた", color: GREEN },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1500 }}>
        {/* Time jump visualization */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 48 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: SKY, fontFamily: FONT_SANS }}>1970</div>
            <div style={{ fontSize: 18, color: TEXT_SECONDARY, fontFamily: FONT_SANS }}>冷凍睡眠へ</div>
          </div>

          {/* Arrow */}
          <div style={{ position: "relative", width: 400, height: 6 }}>
            <div
              style={{
                width: `${arrowProgress * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${SKY}, ${GOLD})`,
                borderRadius: 3,
              }}
            />
            <div style={{
              position: "absolute",
              right: -16,
              top: -9,
              fontSize: 24,
              color: GOLD,
              opacity: arrowProgress,
            }}>
              ▶
            </div>
            <div style={{
              position: "absolute",
              top: -30,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 18,
              color: TEXT_SECONDARY,
              fontFamily: FONT_SANS,
              opacity: arrowProgress,
            }}>
              30年間の眠り
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: GOLD, fontFamily: FONT_SANS }}>2000</div>
            <div style={{ fontSize: 18, color: TEXT_SECONDARY, fontFamily: FONT_SANS }}>目覚め</div>
          </div>
        </div>

        {/* Discoveries */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          未来で知った驚愕の事実
        </div>

        {discoveries.map((item, i) => {
          const delay = fps * 1.5 + i * fps * 0.7;
          const dOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 20,
                opacity: dOpacity,
                backgroundColor: CARD_BG,
                borderRadius: 14,
                padding: "18px 28px",
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <div style={{ fontSize: 28, color: item.color, fontFamily: FONT_SANS, fontWeight: 800 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 30, color: TEXT_PRIMARY, fontFamily: FONT }}>
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Time Travel & Revenge ─────────────────────────
const TimeTravelScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const actions = [
    { icon: "⏰", text: "タイムマシンで1970年に帰還", color: SKY },
    { icon: "⚔️", text: "マイルズとベルの陰謀を阻止", color: ROSE },
    { icon: "📜", text: "特許を守り、未来への布石を打つ", color: GREEN },
    { icon: "🐈", text: "ピートとリッキーの未来を守る", color: GOLD },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1500 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: SKY,
            fontFamily: FONT,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          時間を超えた逆転劇
        </div>
        <div
          style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          2000年から1970年へ &mdash; ダンの反撃が始まる
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {actions.map((item, i) => {
            const delay = fps * 0.5 + i * fps * 0.5;
            const cardOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardScale = interpolate(frame, [delay, delay + fps * 0.4], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  width: "46%",
                  backgroundColor: CARD_BG,
                  borderRadius: 20,
                  padding: "32px 36px",
                  borderBottom: `3px solid ${item.color}`,
                  opacity: cardOpacity,
                  transform: `scale(${cardScale})`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.5 }}>
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: The Cat & The Door ────────────────────────────
const DoorScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const quoteOpacity = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const doorOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const doorGlow = interpolate(frame, [fps * 3, fps * 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center", maxWidth: 1400 }}>
        {/* Door visualization */}
        <div style={{ marginBottom: 48, opacity: doorOpacity }}>
          <div
            style={{
              display: "inline-flex",
              gap: 16,
              fontSize: 48,
            }}
          >
            {"🚪🚪🚪🚪🚪".split("").filter((_, i) => i % 2 === 0).map((_, i) => (
              <div
                key={i}
                style={{
                  opacity: i === 4 ? 1 : 0.3,
                  filter: i === 4 ? `drop-shadow(0 0 ${20 * doorGlow}px ${GOLD})` : "none",
                  transform: i === 4 ? `scale(${1 + doorGlow * 0.2})` : "scale(1)",
                }}
              >
                🚪
              </div>
            ))}
          </div>
          <div style={{ fontSize: 40, marginTop: 8 }}>🐈</div>
        </div>

        {/* Quote */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 20,
            padding: "40px 56px",
            borderLeft: `4px solid ${GOLD}`,
            opacity: quoteOpacity,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: TEXT_PRIMARY,
              fontFamily: FONT,
              fontStyle: "italic",
              lineHeight: 1.7,
            }}
          >
            冬になると、ピートは家中のドアを一つ一つ試して回る。
            <br />
            どこかに夏に通じるドアがあるはずだと信じて。
          </div>
          <div style={{ fontSize: 20, color: GOLD, fontFamily: FONT_SANS, marginTop: 20, fontWeight: 600 }}>
            &mdash; 「夏への扉」のタイトルの由来
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginTop: 32,
            opacity: doorOpacity,
            lineHeight: 1.6,
          }}
        >
          扉が閉ざされても、別の扉を探し続けること。
          <br />
          それが「夏への扉」。
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

  const quoteOpacity = interpolate(frame, [fps * 0.3, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const catOpacity = interpolate(frame, [fps * 2, fps * 2.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: 2,
            lineHeight: 1.6,
            background: `linear-gradient(135deg, ${GOLD}, ${WARM}, ${SKY})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: quoteOpacity,
          }}
        >
          裏切られても、すべてを失っても、
          <br />
          必ず「夏への扉」は見つかる。
        </div>

        <div style={{ fontSize: 60, marginTop: 24, opacity: catOpacity }}>
          🐈
        </div>

        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 24,
            opacity: tagOpacity,
          }}
        >
          ロバート・A・ハインライン
        </div>
        <div
          style={{
            fontSize: 40,
            color: GOLD,
            fontFamily: FONT,
            fontWeight: 700,
            marginTop: 8,
            opacity: tagOpacity,
            letterSpacing: 4,
          }}
        >
          夏への扉
        </div>
        <div
          style={{
            fontSize: 18,
            color: TEXT_SECONDARY,
            fontFamily: FONT_SANS,
            marginTop: 8,
            opacity: tagOpacity,
            fontStyle: "italic",
          }}
        >
          The Door into Summer &middot; 1956
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const DoorIntoSummerVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [
    TitleScene,
    FallScene,
    FutureScene,
    TimeTravelScene,
    DoorScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/door-into-summer/bgm.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, FPS * 2], [0, 0.13], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - FPS * 3, durationInFrames],
            [0.13, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {scenes.map((SceneComp, i) => {
        const from = offset;
        const dur = sceneDurations[i] ?? 150;
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
