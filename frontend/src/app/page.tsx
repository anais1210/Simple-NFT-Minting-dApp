"use client";
import React, { useState } from "react";
import { ethers, BrowserProvider } from "ethers";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      let accounts = await provider.send("eth_accounts", []); // vérifie s’il y a déjà une connexion

      if (accounts.length === 0) {
        accounts = await provider.send("eth_requestAccounts", []); // ouvre MetaMask SEULEMENT si pas connecté
      }

      setAccount(accounts[0]);
      console.log("Connected:", accounts[0]);
    } catch (err: any) {
      if (err.code === -32002) {
        alert(
          "A connection request is already pending in MetaMask. Please check your wallet."
        );
      } else {
        console.error(err);
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
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition">
          Mint Now
        </button>
      </div>
    </div>
  );
}
