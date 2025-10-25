import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    holesky: {
      url: process.env.HOLESKY_URL || "",
      accounts: [process.env.PRIVATE_KEY!],
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
