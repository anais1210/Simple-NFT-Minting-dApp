"use client";

import { useEffect, useState } from "react";
import { ethers, BrowserProvider } from "ethers";

import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [network, setNetwork] = useState("");

  // ✅ Connexion wallet
  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask first!");
          return;
        }
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name);
      } catch (error) {
        console.error("Error fetching network:", error);
      }
    };
    fetchNetwork();
  }, []);

  const handleConnect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("No wallet found. Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  // ✅ Déconnexion
  const handleDisconnect = async () => {
    setShowModal(false);
    setAccount(null);
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.warn("Cannot revoke permissions:", err);
      }
    }
  };

  // ✅ Changer de réseau
  const handleSwitchNetwork = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");
    try {
      // Essaie de basculer sur Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xAA36A7" }], // Sepolia
      });
    } catch (error: any) {
      // Si Sepolia n'est pas encore ajoutée, l'ajoute
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xAA36A7",
              chainName: "Sepolia Test Network",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        console.error(error);
        alert("Failed to switch network. See console for details.");
      }
    }
  };

  // ✅ Formater adresse
  const formatAddress = (addr: string | null) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // ✅ Auto-update si changement de compte
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="text-2xl font-bold text-white">
            Mintify ✦
          </Link>

          <div className="hidden md:flex gap-8">
            <Link href="#mint" className="text-gray-200 hover:text-white">
              Mint
            </Link>
            <Link href="#collection" className="text-gray-200 hover:text-white">
              Collection
            </Link>
            <Link href="#about" className="text-gray-200 hover:text-white">
              About
            </Link>
          </div>

          <div className="hidden md:flex gap-3">
            {account ? (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
                >
                  {formatAddress(account)}
                </button>
                <button
                  onClick={handleSwitchNetwork}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
                >
                  {network}
                </button>
                {/* <button
                  onClick={handleSwitchNetwork}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
                >
                  Switch Network
                </button> */}
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
              >
                Connect Wallet
              </button>
            )}
          </div>

          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {showModal && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 text-white rounded-2xl p-6 w-80 shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">
              Connected as
              <span className="block text-purple-400 mt-1">
                {formatAddress(account)}
              </span>
            </h3>

            <button
              // onClick={handleSwitchNetwork}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition mb-3"
            >
              {network}
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition mb-3"
            >
              Disconnect
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
