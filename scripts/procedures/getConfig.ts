import { compat, types as T } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  "mempool-source": {
    type: "enum",
    name: "Mempool Source",
    description:
      "Choose where Am I Exposed? fetches Bitcoin blockchain data.\n\n" +
      "- **Public**: Uses mempool.space (blockchain data leaves your device).\n" +
      "- **Local**: Routes all requests through your Mempool instance on StartOS for maximum privacy.",
    values: ["public", "local"],
    "value-names": {
      public: "Public (mempool.space)",
      local: "Local (Mempool on StartOS)",
    },
    default: "local",
  },
});
