import { CA, Network } from "@arcana/ca-sdk";
import { http, createConfig } from "wagmi";
import {
  mainnet,
  optimism,
  base,
  arbitrum,
  avalanche,
  scroll,
  linea,
  polygon,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  baseSepolia,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [
    mainnet,
    optimism,
    arbitrum,
    avalanche,
    base,
    scroll,
    linea,
    polygon,
    // Testnet chains (supported in folly)
    arbitrumSepolia,
    optimismSepolia,
    polygonAmoy,
    baseSepolia,
  ],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [scroll.id]: http(),
    [linea.id]: http(),
    [polygon.id]: http(),
    // Testnet chains (supported in folly)
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export const network = Network.CORAL;

const ca = new CA({
  network,
  debug: true,
});

export const getCA = () => {
  return ca;
};