import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);

  console.log("\nDeploying mintNFT contract...");

  const MintNFTFactory = await hre.ethers.getContractFactory("MintNFT");
  const mintNFT = await MintNFTFactory.deploy(deployer.address);
  const mintNFTAddress = await mintNFT.getAddress();

  console.log("\nDeployment Successfull");
  console.log("--------------------------------");
  console.log("\nNEXT_PUBLIC_MINT_NFT_ADDRESS:", mintNFTAddress);
  console.log("\nNEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
