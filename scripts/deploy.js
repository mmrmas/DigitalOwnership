
const hre = require("hardhat");

async function main() {
  const IPToken = await hre.ethers.getContractFactory("IPToken");
  const ipToken = await IPToken.deploy(100000000n, 1000000000000000000n);

  console.log("IP Token deployed: ", ipToken.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
