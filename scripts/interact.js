// scripts/interact.js
const { ethers } = require("hardhat");

async function main() {
    console.log('Getting the fun token contract...');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const funToken = await ethers.getContractAt('IPToken', contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });