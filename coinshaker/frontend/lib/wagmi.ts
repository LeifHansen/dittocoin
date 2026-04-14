import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "DittoCoin",
  // Get a free project ID at https://cloud.walletconnect.com
  projectId: (() => {
    const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!id || id === "YOUR_WALLETCONNECT_PROJECT_ID") {
      console.warn("⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. Get one at https://cloud.walletconnect.com");
      return "placeholder"; // WalletConnect will fail gracefully; MetaMask/injected still work
    }
    return id;
  })(),
  chains: [mainnet, sepolia],
  ssr: true,
});
