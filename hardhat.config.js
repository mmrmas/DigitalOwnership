require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config() ; 
require("@nomiclabs/hardhat-web3");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks:{
    goerli:{
      url:process.env.INFURA_GOERLI_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    hardhat: {
      chainId: 31337,
    },
  },
    etherscan: {
    	apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100, // You can set a default gas price (in gwei) for gas estimation
    enabled: process.env.REPORT_GAS ? true : false, // Set REPORT_GAS environment variable to enable gas reporting
  },
};
