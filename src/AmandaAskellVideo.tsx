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
const ACCENT = "#c084fc"; // Purple accent
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.05)";

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

// ── Persistent photo layer (visible throughout entire video) ──
const PhotoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const photoOpacity = interpolate(
    frame,
    [0, fps * 0.6, durationInFrames - fps * 0.5, durationInFrames],
    [0, 0.35, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const photoScale = interpolate(frame, [0, fps * 0.8], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 80,
        opacity: photoOpacity,
        transform: `scale(${photoScale})`,
      }}
    >
      <div
        style={{
          width: 960,
          height: 960,
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
  const lineWidth = interpolate(frame, [fps * 0.6, fps * 1.5], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 120,
        opacity,
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            letterSpacing: -2,
            transform: `translateY(${nameY}px)`,
          }}
        >
          Amanda Askell
        </div>
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: ACCENT,
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 32,
            color: ACCENT,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            fontWeight: 500,
            opacity: subtitleOpacity,
            letterSpacing: 4,
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
    { icon: "📝", text: 'Claudeの"魂"を定義する3万語の憲法を執筆' },
    { icon: "🏆", text: "TIME誌 AI最も影響力ある100人 (2024)" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        opacity,
        paddingLeft: 80,
      }}
    >
      <div style={{ width: 820 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            marginBottom: 50,
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
                gap: 24,
                marginBottom: 36,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 36,
                  color: TEXT_PRIMARY,
                  fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
                  fontWeight: 400,
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
        justifyContent: "center",
        alignItems: "flex-start",
        opacity,
        paddingLeft: 80,
      }}
    >
      <div style={{ width: 820 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            marginBottom: 50,
          }}
        >
          Career Journey
        </div>
        <div style={{ position: "relative", paddingLeft: 40 }}>
          {/* Timeline line */}
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
                  left: 12,
                  top: 10,
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
                  gap: 28,
                  marginBottom: 44,
                  opacity: mOpacity,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      color: TEXT_SECONDARY,
                      fontFamily:
                        "SF Pro Display, Helvetica Neue, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {m.year}
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      color: TEXT_PRIMARY,
                      fontFamily:
                        "SF Pro Display, Helvetica Neue, sans-serif",
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      color: TEXT_SECONDARY,
                      fontFamily:
                        "SF Pro Display, Helvetica Neue, sans-serif",
                      fontWeight: 400,
                      marginTop: 4,
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

// ── Scene 4: Key quote / Impact ────────────────────────────
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
        justifyContent: "center",
        alignItems: "flex-start",
        opacity,
        paddingLeft: 80,
      }}
    >
      <div
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 24,
          padding: "60px 80px",
          borderLeft: `4px solid ${ACCENT}`,
          opacity: quoteOpacity,
          transform: `scale(${quoteScale})`,
        }}
      >
        <div
          style={{
            fontSize: 44,
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
            fontSize: 28,
            color: ACCENT,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            fontWeight: 500,
            marginTop: 30,
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
        justifyContent: "center",
        alignItems: "flex-start",
        opacity,
        paddingLeft: 120,
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            letterSpacing: -1,
          }}
        >
          AIに魂を与える哲学者
        </div>
        <div
          style={{
            fontSize: 36,
            color: ACCENT,
            fontFamily: "SF Pro Display, Helvetica Neue, sans-serif",
            fontWeight: 500,
            marginTop: 24,
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
export const AmandaAskellVideo: React.FC = () => {
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
      {/* Photo always visible behind scenes */}
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
