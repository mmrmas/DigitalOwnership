const hre = require("hardhat");

async function main() {
  const IPtrade = await hre.ethers.getContractFactory("IPtrade");
  //const iptrade = await IPtrade.deploy("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
  const iptrade = await IPtrade.deploy("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log("iptrade contract deployed: ", iptrade.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
