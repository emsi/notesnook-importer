import { Text, Button } from "@theme-ui/components";
import { StepContainer } from "./step-container";
import {
  INetworkProvider,
  ProviderSettings,
  OneNote
} from "@notesnook-importer/core";
import { xxhash64 } from "hash-wasm";
import { useCallback, useState } from "react";
import { BrowserStorage } from "@notesnook-importer/storage/dist/browser";
import { TransformResult } from "../types";

type NetworkProviderHandlerProps = {
  provider: INetworkProvider<unknown>;
  onTransformFinished: (result: TransformResult) => void;
};

const settings: ProviderSettings = {
  clientType: "browser",
  hasher: { type: "xxh64", hash: (data) => xxhash64(data) },
  storage: new BrowserStorage("temp"),
  reporter: () => {}
};

export function NetworkProviderHandler(props: NetworkProviderHandlerProps) {
  const { provider, onTransformFinished } = props;
  const [progress, setProgress] = useState<string | null>();

  const startImport = useCallback(() => {
    (async () => {
      if (!provider) return;
      if (provider instanceof OneNote) {
        setProgress(null);
        const errors = await provider.process({
          ...settings,
          clientId: "4952c7cf-9c02-4fb7-b867-b87727bb52d8",
          redirectUri:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000"
              : "https://importer.notesnook.com",
          report: setProgress
        });
        onTransformFinished({ totalNotes: 0, errors });
        setProgress(null);
      }
    })();
  }, [onTransformFinished, provider]);

  return (
    <StepContainer
      sx={{
        flexDirection: "column",
        alignItems: "stretch"
      }}
    >
      {progress ? (
        <>
          <Text variant="title">Importing your notes from {provider.name}</Text>
          <Text
            as="pre"
            variant="body"
            sx={{
              textAlign: "center",
              my: 4,
              bg: "bgSecondary",
              p: 4,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap"
            }}
          >
            {progress}
          </Text>
        </>
      ) : (
        <>
          <Text variant="title">Connect your {provider.name} account</Text>
          <Button
            variant="primary"
            onClick={startImport}
            sx={{ my: 4, alignSelf: "center" }}
          >
            Start importing
          </Button>
        </>
      )}
    </StepContainer>
  );
}
