require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config() ; 
require("@nomiclabs/hardhat-web3");
require("@nomicfoundation/hardhat-verify");

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
    sepolia:{
      url:process.env.SEPOLIA_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId: 31337,
      loggingEnabled: false // Enable Hardhat logging
    },
    mainnet: {
      url:process.env.MAINNET_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY]
    },
    sepolia_arb:{
      url:process.env.SEPOLIA_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY_ARB]
    }
  },
    etherscan: {
    	apiKey: {
        sepolia: process.env.ETHERSCAN_API_KEY,
        mainnet: process.env.ETHERSCAN_API_KEY
      }
    },


  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 100, // You can set a default gas price (in gwei) for gas estimation
    //enabled: process.env.REPORT_GAS ? true : false, // Set REPORT_GAS environment variable to enable gas reporting
  },
  
  sourcify: {
    enabled: true
  }
};
