const hre = require("hardhat");

async function main() {
  const DigitalOwnership = await hre.ethers.getContractFactory("DigitalOwnership");
  const digitalOwnership = await DigitalOwnership.deploy();

  console.log("digitalOwnership contract deployed: ", digitalOwnership.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
