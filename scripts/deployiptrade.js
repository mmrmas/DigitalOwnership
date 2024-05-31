const hre = require("hardhat");

async function main() {
  const IPtrade = await hre.ethers.getContractFactory("IPtrade");
  const iptrade = await IPtrade.deploy("0x33Df9e002Ae0cc01a89ab4F08d130d0549F09ffB");
  //const iptrade = await IPtrade.deploy("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log("iptrade contract deployed: ", iptrade.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
