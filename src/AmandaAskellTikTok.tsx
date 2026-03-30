import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Design tokens ──────────────────────────────────────────
const BG = "#0f0f0f";
const ACCENT = "#c084fc";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.05)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";

// ── Fade helper ────────────────────────────────────────────
const useFade = (fadeIn: number, fadeOut: number, total: number) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, total - fadeOut, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

// ── Persistent photo layer (top area, always visible) ──────
const PhotoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const photoOpacity = interpolate(
    frame,
    [0, fps * 0.6, durationInFrames - fps * 0.5, durationInFrames],
    [0, 0.35, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const photoScale = interpolate(frame, [0, fps * 0.8], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        opacity: photoOpacity,
        transform: `scale(${photoScale})`,
      }}
    >
      <div
        style={{
          width: 1080,
          height: 1080,
          overflow: "hidden",
          border: `4px solid ${ACCENT}`,
          boxShadow: `0 0 80px rgba(192, 132, 252, 0.15)`,
        }}
      >
        <Img
          src={staticFile("images/amanda-askell2..png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 1: Title card ────────────────────────────────────
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, fps * 5);

  const nameY = interpolate(frame, [0, fps * 0.6], [40, 0], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lineWidth = interpolate(frame, [fps * 0.6, fps * 1.5], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 200,
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -2,
            transform: `translateY(${nameY}px)`,
          }}
        >
          Amanda Askell
        </div>
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: ACCENT,
            margin: "20px auto",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 36,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            opacity: subtitleOpacity,
            letterSpacing: 3,
          }}
        >
          Philosopher &middot; AI Researcher &middot; Anthropic
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Who is she ────────────────────────────────────
const ProfileScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, fps * 6);

  const items = [
    { icon: "🎓", text: "哲学博士 (NYU) — 無限倫理学" },
    { icon: "🧠", text: "Claudeの性格設計の責任者" },
    { icon: "📝", text: 'Claudeの"魂"を定義する\n3万語の憲法を執筆' },
    { icon: "🏆", text: "TIME誌 AI最も影響力ある\n100人 (2024)" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        opacity,
      }}
    >
      <div style={{ width: 900, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: FONT,
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          Who is Amanda Askell?
        </div>
        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.6;
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
                gap: 20,
                marginBottom: 28,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <span style={{ fontSize: 48, flexShrink: 0 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 42,
                  color: TEXT_PRIMARY,
                  fontFamily: FONT,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  whiteSpace: "pre-line",
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Career Journey ────────────────────────────────
const CareerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, fps * 6);

  const milestones = [
    { year: "〜2018", label: "NYU 哲学博士号取得", sub: "無限倫理学を研究" },
    { year: "2018", label: "OpenAI 入社", sub: "GPT-3論文を共同執筆" },
    { year: "2021", label: "Anthropic 入社", sub: "Claudeの性格チームをリード" },
    { year: "2024", label: "TIME 100 AI 選出", sub: "AI界で最も影響力ある人物に" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        opacity,
      }}
    >
      <div style={{ width: 900, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: FONT,
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          Career Journey
        </div>
        <div style={{ position: "relative", paddingLeft: 36 }}>
          {(() => {
            const lineH = interpolate(
              frame,
              [fps * 0.3, fps * 3.5],
              [0, 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 8,
                  width: 3,
                  height: `${lineH}%`,
                  backgroundColor: ACCENT,
                  borderRadius: 2,
                }}
              />
            );
          })()}
          {milestones.map((m, i) => {
            const delay = fps * 0.6 + i * fps * 0.7;
            const mOpacity = interpolate(
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
                  alignItems: "flex-start",
                  gap: 22,
                  marginBottom: 32,
                  opacity: mOpacity,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 34,
                      color: TEXT_SECONDARY,
                      fontFamily: FONT,
                      fontWeight: 600,
                    }}
                  >
                    {m.year}
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      color: TEXT_PRIMARY,
                      fontFamily: FONT,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      color: TEXT_SECONDARY,
                      fontFamily: FONT,
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {m.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Key quote ─────────────────────────────────────
const QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, fps * 5);

  const quoteOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const quoteScale = interpolate(
    frame,
    [fps * 0.3, fps * 1.2],
    [0.95, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const authorOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 180,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 20,
          padding: "48px 56px",
          borderLeft: `4px solid ${ACCENT}`,
          opacity: quoteOpacity,
          transform: `scale(${quoteScale})`,
          margin: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: TEXT_PRIMARY,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          &ldquo;AIには、物事がうまくいかなくなる方法が数多くある&rdquo;
        </div>
        <div
          style={{
            fontSize: 34,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            marginTop: 28,
            opacity: authorOpacity,
          }}
        >
          — Amanda Askell, Der Spiegel
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Closing ───────────────────────────────────────
const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, fps * 4);

  const taglineOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 260,
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -1,
          }}
        >
          AIに魂を与える哲学者
        </div>
        <div
          style={{
            fontSize: 44,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            marginTop: 20,
            opacity: taglineOpacity,
            letterSpacing: 2,
          }}
        >
          Amanda Askell
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ───────────────────────────────────────
export const AmandaAskellTikTok: React.FC = () => {
  const { fps } = useVideoConfig();

  const scenes = [
    { component: TitleScene, duration: fps * 5 },
    { component: ProfileScene, duration: fps * 6 },
    { component: CareerScene, duration: fps * 6 },
    { component: QuoteScene, duration: fps * 5 },
    { component: ClosingScene, duration: fps * 4 },
  ];

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={totalDuration}>
        <PhotoLayer />
      </Sequence>
      {scenes.map((scene, i) => {
        const from = offset;
        offset += scene.duration;
        const Scene = scene.component;
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={scene.duration}
            premountFor={fps * 0.5}
          >
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
