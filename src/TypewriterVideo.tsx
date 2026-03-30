import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FULL_TEXT = "AIが動画を作る時代";
const FONT_SIZE = 80;
const CHAR_FRAMES = 2;
const CURSOR_BLINK_FRAMES = 16;
const HOLD_SECONDS = 2;

const Cursor: React.FC<{
  frame: number;
  blinkFrames: number;
}> = ({ frame, blinkFrames }) => {
  const opacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <span style={{ opacity }}>{"\u258C"}</span>;
};

export const TypewriterVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalTypingFrames = FULL_TEXT.length * CHAR_FRAMES;
  const holdFrames = Math.round(fps * HOLD_SECONDS);

  const typedChars = Math.min(
    FULL_TEXT.length,
    Math.floor(frame / CHAR_FRAMES)
  );
  const typedText = FULL_TEXT.slice(0, typedChars);

  const holdEnd = totalTypingFrames + holdFrames;

  // Fade out cursor near the very end
  const cursorBaseOpacity =
    frame >= holdEnd - fps * 0.5
      ? interpolate(frame, [holdEnd - fps * 0.5, holdEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "#ffffff",
          fontSize: FONT_SIZE,
          fontWeight: 700,
          fontFamily: "'Courier New', 'SF Mono', monospace",
          letterSpacing: 4,
        }}
      >
        <span>{typedText}</span>
        <span style={{ opacity: cursorBaseOpacity }}>
          <Cursor frame={frame} blinkFrames={CURSOR_BLINK_FRAMES} />
        </span>
      </div>
    </AbsoluteFill>
  );
};
