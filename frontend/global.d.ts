// global.d.ts or next-env.d.ts
import { Eip1193Provider } from "ethers"; // Or the specific provider type you are using

declare global {
  interface Window {
    ethereum?: Eip1193Provider; // Use Eip1193Provider for better typing, or 'any' if unsure
  }
}

export {}; // Ensure this file is treated as a module
