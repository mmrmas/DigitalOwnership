const hre = require("hardhat");

async function main() {
  const IPtrade = await hre.ethers.getContractFactory("IPtrade");
  const iptrade = await IPtrade.deploy("0xF2232724971Dc4f1a90E9786445dc6945932E44e");
  
  console.log("iptrade contract deployed: ", iptrade.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
