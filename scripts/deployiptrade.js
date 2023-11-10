const hre = require("hardhat");

async function main() {
  const IPtrade = await hre.ethers.getContractFactory("IPtrade");
  const iptrade = await IPtrade.deploy("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  await iptrade.deployed();
  await iptrade.setWhitelistedTokens('IPT', 0x5FbDB2315678afecb367f032d93F642f64180aa3);
  await iptrade.setWhitelistedTokensPrice(0x5FbDB2315678afecb367f032d93F642f64180aa3, 1000000000000000000n);

  console.log("iptrade contract deployed: ", iptrade.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
