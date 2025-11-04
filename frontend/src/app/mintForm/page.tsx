"use client";

import { useState } from "react";

import { ethers, BrowserProvider } from "ethers";
import abi from "@/abi/MintNFT.json";

export default function MintForm() {
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [mintCount, setMintCount] = useState(1); // compteur de NFT

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }));
  };

  const uploadToIPFS = async () => {
    try {
      if (!form.image) throw new Error("Please upload an image.");

      // STEP 1: Upload image to a specific group
      const data = new FormData();
      const fileName = `${mintCount}.jpeg`;
      data.append("file", form.image, fileName);
      data.append("network", "public");
      //   data.append("groupId", `${process.env.NEXT_PUBLIC_GROUP_ID!}`);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: data,
        }
      );

      const imgResult = await res.json();
      const imageCid = imgResult.IpfsHash;
      const imageUrl = `ipfs://${imageCid}`;
      console.log("Image URL:", imageUrl);

      // STEP 2: Create metadata JSON and upload it
      const nftMetadata = {
        pinataContent: {
          name: form.name || `NFT #${mintCount}`,
          description: form.description,
          image: imageUrl,
        },
        pinataMetadata: {
          name: `${mintCount}.json`,
        },
        // groupId: process.env.NEXT_PUBLIC_GROUP_ID,
      };

      const metaRes = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: JSON.stringify(nftMetadata),
        }
      );

      const metaResult = await metaRes.json();
      console.log("Metadata URI:", `ipfs://${metaResult.IpfsHash}`);
    } catch (error) {
      console.error("❌ Error uploading to IPFS:", error);
    }
  };

  const handleMint = async (uri: string) => {
    if (!window.ethereum) {
      alert("Please install MetaMask first!");
      return;
    }
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_MINT_NFT_ADDRESS!,
      abi.abi,
      signer
    );

    const tx = await contract.safeMint(await signer.getAddress(), uri);
    await tx.wait();
    alert("NFT minted successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const uri = await uploadToIPFS();
      await handleMint(uri);
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 bg-gray-900 text-white rounded-2xl w-full max-w-md shadow-xl border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Mint your NFT</h2>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-600"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-600"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 bg-gray-800 border border-gray-700 rounded"
        />

        {form.image && (
          <img
            src={URL.createObjectURL(form.image)}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-gray-700 mt-2"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium mt-2 transition"
        >
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>
    </div>
  );
}
