import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { SpaceVideo } from "./SpaceVideo";
import { AlpsVideo } from "./AlpsVideo";
import { TypewriterVideo } from "./TypewriterVideo";
import { AmandaAskellVideo } from "./AmandaAskellVideo";
import { AmandaAskellTikTok } from "./AmandaAskellTikTok";
import {
  AmandaAskellTikTokNarrated,
  narratedSchema,
  calculateNarratedMetadata,
} from "./AmandaAskellTikTokNarrated";
import {
  DarioVsSamVideo,
  darioSamSchema,
  calculateDarioSamMetadata,
} from "./DarioVsSamVideo";
import {
  IlyaSutskeverVideo,
  ilyaSchema,
  calculateIlyaMetadata,
} from "./IlyaSutskeverVideo";
import {
  OpenAICoupVideo,
  openaiCoupSchema,
  calculateOpenAICoupMetadata,
} from "./OpenAICoupVideo";
import {
  OpenClawVideo,
  openClawSchema,
  calculateOpenClawMetadata,
} from "./OpenClawVideo";
import {
  DoorIntoSummerVideo,
  doorIntoSummerSchema,
  calculateDoorIntoSummerMetadata,
} from "./DoorIntoSummerVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}

      <Composition
        id="SpaceVideo"
        component={SpaceVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AlpsVideo"
        component={AlpsVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TypewriterVideo"
        component={TypewriterVideo}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AmandaAskell"
        component={AmandaAskellVideo}
        durationInFrames={780}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AmandaAskellTikTok"
        component={AmandaAskellTikTok}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AmandaAskellNarrated"
        component={AmandaAskellTikTokNarrated}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
        schema={narratedSchema}
        defaultProps={{ sceneDurations: [150, 180, 180, 150, 120] }}
        calculateMetadata={calculateNarratedMetadata}
      />
      <Composition
        id="DarioVsSam"
        component={DarioVsSamVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        schema={darioSamSchema}
        defaultProps={{ sceneDurations: [150, 180, 180, 180, 150, 120] }}
        calculateMetadata={calculateDarioSamMetadata}
      />
      <Composition
        id="IlyaSutskever"
        component={IlyaSutskeverVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        schema={ilyaSchema}
        defaultProps={{ sceneDurations: [150, 180, 180, 150, 120] }}
        calculateMetadata={calculateIlyaMetadata}
      />
      <Composition
        id="OpenAICoup"
        component={OpenAICoupVideo}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        schema={openaiCoupSchema}
        defaultProps={{ sceneDurations: [180, 210, 240, 210, 210, 180] }}
        calculateMetadata={calculateOpenAICoupMetadata}
      />
      <Composition
        id="OpenClaw"
        component={OpenClawVideo}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        schema={openClawSchema}
        defaultProps={{ sceneDurations: [180, 210, 240, 210, 210, 180] }}
        calculateMetadata={calculateOpenClawMetadata}
      />
      <Composition
        id="DoorIntoSummer"
        component={DoorIntoSummerVideo}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        schema={doorIntoSummerSchema}
        defaultProps={{ sceneDurations: [180, 210, 240, 210, 210, 180] }}
        calculateMetadata={calculateDoorIntoSummerMetadata}
      />
    </>
  );
};
