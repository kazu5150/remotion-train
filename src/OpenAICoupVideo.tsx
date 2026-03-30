import {
  AbsoluteFill,
  Img,
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
const BG = "#0a0a0a";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const openaiCoupSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof openaiCoupSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/openai-coup/scene-01.mp3",
  "voiceover/openai-coup/scene-02.mp3",
  "voiceover/openai-coup/scene-03.mp3",
  "voiceover/openai-coup/scene-04.mp3",
  "voiceover/openai-coup/scene-05.mp3",
  "voiceover/openai-coup/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateOpenAICoupMetadata: CalculateMetadataFunction<
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

// ── Portrait component ─────────────────────────────────────
const Portrait: React.FC<{
  src: string;
  size: number;
  borderColor: string;
  opacity?: number;
  scale?: number;
}> = ({ src, size, borderColor, opacity = 1, scale = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      border: `3px solid ${borderColor}`,
      boxShadow: `0 0 30px ${borderColor}40`,
      opacity,
      transform: `scale(${scale})`,
      flexShrink: 0,
    }}
  >
    <Img
      src={staticFile(src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);

// ── Scene 1: Title — The Coup ──────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const dateOpacity = interpolate(frame, [fps * 0.2, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [fps * 0.6, fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [fps * 0.6, fps * 1.3], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [fps * 1, fps * 1.8], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const portraitOpacity = interpolate(frame, [fps * 0.8, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* Date badge */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: RED,
          fontFamily: FONT,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: dateOpacity,
          marginBottom: 24,
        }}
      >
        2023年11月17日
      </div>

      {/* Portraits row */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 36,
          opacity: portraitOpacity,
          alignItems: "center",
        }}
      >
        <Portrait src="images/sam-altman.jpg" size={160} borderColor={RED} />
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: RED,
            fontFamily: FONT,
          }}
        >
          ×
        </div>
        <Portrait src="images/ilya-sutskever.jpg" size={160} borderColor={PURPLE} />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          letterSpacing: -1,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        OpenAI 解任劇
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          background: `linear-gradient(90deg, ${RED}, ${AMBER})`,
          borderRadius: 2,
          marginTop: 16,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 30,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          marginTop: 20,
          opacity: subtitleOpacity,
          textAlign: "center",
        }}
      >
        AI史上最大の権力闘争 — わずか4日間のドラマ
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: The Firing ────────────────────────────────────
const FiringScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const events = [
    {
      time: "11月17日 金曜",
      text: "取締役会がGoogle Meetでアルトマンに解任を通告",
      color: RED,
    },
    {
      time: "直後",
      text: "「コミュニケーションが一貫して率直でなかった」と発表",
      color: RED,
    },
    {
      time: "同日",
      text: "ミラ・ムラティが暫定CEOに就任",
      color: AMBER,
    },
    {
      time: "11月18日",
      text: "共同創設者グレッグ・ブロックマンが辞任",
      color: AMBER,
    },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: RED,
            fontFamily: FONT,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          DAY 1 — 電撃解任
        </div>
        <div
          style={{
            fontSize: 22,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          Microsoftにも投資家にも事前通知なし
        </div>

        {events.map((item, i) => {
          const delay = fps * 0.6 + i * fps * 0.65;
          const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [delay, delay + fps * 0.4], [50, 0], {
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
              <div
                style={{
                  fontSize: 20,
                  color: item.color,
                  fontFamily: FONT,
                  fontWeight: 700,
                  minWidth: 160,
                }}
              >
                {item.time}
              </div>
              <div
                style={{ fontSize: 30, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400 }}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Chaos & Microsoft ─────────────────────────────
const ChaosScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    {
      icon: "📱",
      title: "エメット・シアーが暫定CEO",
      desc: "元Twitch CEOが取締役会に指名される",
      color: AMBER,
    },
    {
      icon: "🏢",
      title: "Microsoft がアルトマンを雇用発表",
      desc: "ナデラCEOが新AI研究チームのリーダーに任命",
      color: BLUE,
    },
    {
      icon: "📝",
      title: "社員745/770名が署名",
      desc: "「取締役辞任とアルトマン復帰」を要求する公開書簡",
      color: GREEN,
    },
    {
      icon: "😔",
      title: "サツケバーが後悔を表明",
      desc: "署名に参加し「復帰のため全力を尽くす」と発言",
      color: PURPLE,
    },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: AMBER,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          DAY 2-4 — 混乱と逆転
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {items.map((item, i) => {
            const delay = fps * 0.5 + i * fps * 0.6;
            const cardOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardY = interpolate(frame, [delay, delay + fps * 0.4], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  width: "47%",
                  backgroundColor: CARD_BG,
                  borderRadius: 20,
                  padding: "28px 32px",
                  borderTop: `3px solid ${item.color}`,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    fontFamily: FONT,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: The Return ────────────────────────────────────
const ReturnScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const portraitScale = interpolate(frame, [fps * 0.3, fps * 1], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const portraitOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [fps * 1, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const detailOpacity = interpolate(frame, [fps * 1.8, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boardMembers = [
    { name: "ブレット・テイラー", role: "新議長 (元Salesforce CEO)" },
    { name: "ラリー・サマーズ", role: "元米財務長官" },
    { name: "アダム・ダンジェロ", role: "Quora CEO (留任)" },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 1400 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: GREEN,
            fontFamily: FONT,
            marginBottom: 32,
          }}
        >
          11月22日 — CEO復帰
        </div>

        {/* Portrait with glow */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 36,
            opacity: portraitOpacity,
          }}
        >
          <Portrait src="images/sam-altman.jpg" size={200} borderColor={GREEN} scale={portraitScale} />
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            opacity: textOpacity,
            marginBottom: 8,
          }}
        >
          サム・アルトマン CEO復帰
        </div>
        <div
          style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            opacity: textOpacity,
            marginBottom: 40,
          }}
        >
          ブロックマンも社長として復帰
        </div>

        {/* New board */}
        <div
          style={{
            fontSize: 22,
            color: AMBER,
            fontFamily: FONT,
            fontWeight: 600,
            marginBottom: 20,
            opacity: detailOpacity,
          }}
        >
          新取締役会
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", opacity: detailOpacity }}>
          {boardMembers.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "16px 24px",
                borderBottom: `2px solid ${AMBER}`,
              }}
            >
              <div style={{ fontSize: 24, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 600 }}>
                {m.name}
              </div>
              <div style={{ fontSize: 18, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 4 }}>
                {m.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Aftermath ─────────────────────────────────────
const AftermathScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    {
      person: "イリア・サツケバー",
      event: "2024年5月にOpenAIを退社、Safe Superintelligence Inc.を設立",
      color: PURPLE,
      img: "images/ilya-sutskever.jpg",
    },
    {
      person: "ミラ・ムラティ",
      event: "2024年9月にCTOを辞任、6年半の在籍に幕",
      color: AMBER,
      img: null,
    },
    {
      person: "グレッグ・ブロックマン",
      event: "2024年8月にOpenAIを退社",
      color: BLUE,
      img: "images/greg-brockman.jpg",
    },
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
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          その後
        </div>
        <div
          style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          主要メンバーの相次ぐ離脱
        </div>

        {items.map((item, i) => {
          const delay = fps * 0.6 + i * fps * 0.7;
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
                marginBottom: 28,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "20px 28px",
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              {item.img ? (
                <Portrait src={item.img} size={70} borderColor={item.color} />
              ) : (
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    backgroundColor: `${item.color}30`,
                    border: `2px solid ${item.color}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 32,
                    flexShrink: 0,
                  }}
                >
                  👤
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    fontFamily: FONT,
                  }}
                >
                  {item.person}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    marginTop: 4,
                  }}
                >
                  {item.event}
                </div>
              </div>
            </div>
          );
        })}
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

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 800,
            fontFamily: FONT,
            letterSpacing: -1,
            lineHeight: 1.5,
            background: `linear-gradient(135deg, ${RED}, ${AMBER}, ${GREEN})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: quoteOpacity,
          }}
        >
          利益と安全のはざまで
          <br />
          AIの未来を問う4日間
        </div>
        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 32,
            opacity: tagOpacity,
            letterSpacing: 4,
          }}
        >
          OpenAI CEO解任劇 — 2023年11月
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const OpenAICoupVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [
    TitleScene,
    FiringScene,
    ChaosScene,
    ReturnScene,
    AftermathScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/openai-coup/bgm.mp3")}
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
