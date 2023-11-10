
const hre = require("hardhat");

async function main() {
  const IPToken = await hre.ethers.getContractFactory("IPToken");
  const ipToken = await IPToken.deploy(100000000, 50);

  await ipToken.deployed();

  console.log("IP Token deployed: ", ipToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
