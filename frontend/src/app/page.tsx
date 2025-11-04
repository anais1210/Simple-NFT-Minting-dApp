"use client";
import React, { useState } from "react";
import { ethers, BrowserProvider } from "ethers";
import abi from "@/abi/MintNFT.json";

export default function Home() {
  const handleMint = async (uri: string) => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_MINT_NFT_ADDRESS;
      if (!contractAddress) {
        alert("Contract address is missing in .env");
        return;
      }

      const contract = new ethers.Contract(contractAddress, abi.abi, signer);
      const userAddress = await signer.getAddress();

      console.log("Minting NFT for:", userAddress, "URI:", uri);
      console.log(contractAddress, await provider.getNetwork());

      // ✅ Transaction
      const tx = await contract.safeMint(userAddress, uri, {
        gasLimit: 500000,
      });

      console.log("Transaction sent:", tx.hash);
      await tx.wait();

      alert("✅ NFT minted successfully!");
    } catch (error: any) {
      console.error("❌ Error minting NFT:", error);
      if (error.code === "ACTION_REJECTED") {
        alert("You rejected the transaction.");
      } else {
        alert("Failed to mint NFT. Check console for details.");
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600 flex flex-col items-center justify-center text-white">
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Mint Your NFT</h1>
        <p className="text-sm text-gray-300 mb-6">
          Connect your wallet to mint a unique NFT.
        </p>
        <button
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition"
          onClick={() =>
            handleMint(
              "https://amber-definite-flea-1.mypinata.cloud/ipfs/bafkreiacwy7e5mp73fuchuqdrwbytd4q7ihdhmwfuszaeoqhjflxhymsxu"
            )
          }
        >
          Mint Now
        </button>
      </div>
    </div>
  );
}
