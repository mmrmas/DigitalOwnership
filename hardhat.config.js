require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config() ; 

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks:{
    goerli:{
      url:process.env.INFURA_GOERLI_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId: 31337
    },
  },
    etherscan: {
    	apiKey: process.env.ETHERSCAN_API_KEY
  },
};
