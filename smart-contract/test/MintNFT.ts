import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre, { ethers } from "hardhat";

describe("MintNFT", function () {
  async function deployMintNFT() {
    const [owner, user1, user2] = await ethers.getSigners();
    const MintNFT = await hre.ethers.getContractFactory("MintNFT");
    const mintNFT = await MintNFT.deploy(owner.address);
    return { mintNFT, owner, user1, user2 };
  }

  it("should set the correct owner", async function () {
    const { mintNFT, owner } = await loadFixture(deployMintNFT);
    expect(await mintNFT.owner()).to.equal(owner.address);
  });

  it("user can mint a NFT", async function () {
    const { mintNFT, owner } = await loadFixture(deployMintNFT);

    const tokenURI = "ipfs://test-uri-1";
    const tx = await mintNFT.safeMint(owner.address, tokenURI);
    await tx.wait();

    expect(await mintNFT.ownerOf(0)).to.equal(owner.address);
    expect(await mintNFT.tokenURI(0)).to.equal(tokenURI);
  });
  it("should increment token IDs correctly", async function () {
    const { mintNFT, owner, user1 } = await loadFixture(deployMintNFT);

    const uri1 = "ipfs://test-uri-1";
    const uri2 = "ipfs://test-uri-2";

    const tx1 = await mintNFT.safeMint(owner.address, uri1);
    await tx1.wait();

    const tx2 = await mintNFT.safeMint(user1.address, uri2);
    await tx2.wait();

    expect(await mintNFT.ownerOf(0)).to.equal(owner.address);
    expect(await mintNFT.tokenURI(0)).to.equal(uri1);

    expect(await mintNFT.ownerOf(1)).to.equal(user1.address);
    expect(await mintNFT.tokenURI(1)).to.equal(uri2);
  });

  it("supports ERC721 interface", async function () {
    const { mintNFT, owner } = await loadFixture(deployMintNFT);
    expect(await mintNFT.supportsInterface("0x80ac58cd")).to.equal(true);
  });
});
