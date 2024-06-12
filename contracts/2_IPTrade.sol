// SPDX-License-Identifier: MIT
// contracts/2_IPTrade.sol

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; //tested


interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint);

    function approve(address spender, 
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, 
        address indexed to, 
        uint256 value
        );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract IPtrade is ReentrancyGuard {

       /////////////////////
      // token variables  /
     /////////////////////        

    // owner: the owner wallet address of this contract     
    address payable public owner;
    // token: the token instance
    IERC20 public token;



       /////////////////////
      // public variables /
     /////////////////////  
  
    // freeIpTokenwithdrawal: the tokens distributed through the faucet
    uint256 public freeIpTokenwithdrawal = 1000 * (10 ** 18);

    // registerIPCostIpt: the cost to register IP
    uint256 public registerIPCostIpt = 100 * (10 ** 18);

    // transferIPCostIpt: the cost to tranfer IP    
    uint256 public transferIPCostIpt = 100 * (10 ** 18);

    // lockTime: the time that locks and delays, such as faucet transfers, and IP offerings
    uint256 public lockTime = 604800 seconds;



       /////////////////////
      //   events         /
     /////////////////////  

    // IPRegistered: emits owner and the SHA512 document fingerprint
    event IPRegistered(
        address  owner, 
        string  sha512
    );

    // SalesIntentCreated: emits wallet address and SHA512 document fingerprint when an IP is offered
    event SalesIntentCreated(
        address  seller,
        string  sha512
    );

    // SalesIntentCancelled: emits wallet address and SHA512 document fingerprint when an IP is cancelled
    event SalesIntentCancelled(
        address  seller, 
        string  sha512
    );

   // IPTransferred: emits old and new IP owner; and SHA512 document fingerprint; and IPT paid, when IP is tranferred 
    event IPTransferred(
        address  from,
        address  to,
        string  sha512,
        uint256 amount
    );

    // TokensRequested: emits wallet address and amount when Tokens are distributed through the faucet
    event TokensRequested(
        address  requester, 
        uint256 amount
    );

    // OwnerIPTWithdrawn: emits IPT amount tranferred from this contract to the owner
    event OwnerIPTWithdrawn(
        uint256 amount
    );

    // IpDeleted: emits the original owner of IP and the SHA512 document fingerprint that is deleted from the chain
    event IpDeleted(
        address  ipowner,
        string  sha512
    );

       /////////////////////
      //   structs        /
     /////////////////////  


    // IPowner: This struct contains data about IP owners, i.e. wallet address, moment of creation, 
    // and a boolean value to show if it exists
    struct IPowner {
        address owner;
        uint96 creationTimeStamp;
        bool exists;
    }

    // Onsale: This struct contains data about IP on offer / for sale, i.e. the owner, buyer addresses, 
    // salesprice, the moment of creationa an a boolean value to show if it exists
    struct Onsale {
        address buyer_address;
        uint192 salesPrice;
        uint64 creationTimeStamp;
        bool exists;
    }

      /////////////////////
      //   mappings       /
     /////////////////////  


    // sha512s: the main dataframe of this contract, holds hashes as keys and IP ownership info as values
    mapping(bytes32 => IPowner) private sha512s;

    // lastAccessTime: a mapping to keep track on the last access time to prevent wallets to drain the faucet
    mapping(address => uint256) private lastAccessTime;

    // onsale: a data frame with hash as keys and onsale info as value, used for 
    // keeping track on which IP is being registered for IP tranfer
    mapping(bytes32 => Onsale) private onsale;

      /////////////////////
     //   constructor   /
    /////////////////////  

    // one-time function to establish the contract
    constructor(address tokenAddress) payable {
        token = IERC20(tokenAddress);
        owner = payable(msg.sender);
    }



       /////////////////////
      //  data  test      /
     //  functions       /
    /////////////////////  

    // checkSha512:  takes a string and reports if it has the correct length of 128 chars
        function checkSha512 (
        string memory str
    ) private pure returns (bool) {
        bytes memory stringInBytes = bytes(str);
        uint256 strLength = stringInBytes.length;
        require(strLength == 128, "sha512 incorr");

        bool valid = true;
        
        assembly {
            let len := mload(stringInBytes)
            let data := add(stringInBytes, 0x20)
            for { let i := 0 } lt(i, len) { i := add(i, 1) } {
                let char := byte(0, mload(add(data, i)))
                switch char
                case 0x30 { continue } // '0'
                case 0x31 { continue } // '1'
                case 0x32 { continue } // '2'
                case 0x33 { continue } // '3'
                case 0x34 { continue } // '4'
                case 0x35 { continue } // '5'
                case 0x36 { continue } // '6'
                case 0x37 { continue } // '7'
                case 0x38 { continue } // '8'
                case 0x39 { continue } // '9'
                case 0x61 { continue } // 'a'
                case 0x62 { continue } // 'b'
                case 0x63 { continue } // 'c'
                case 0x64 { continue } // 'd'
                case 0x65 { continue } // 'e'
                case 0x66 { continue } // 'f'
                case 0x41 { continue } // 'A'
                case 0x42 { continue } // 'B'
                case 0x43 { continue } // 'C'
                case 0x44 { continue } // 'D'
                case 0x45 { continue } // 'E'
                case 0x46 { continue } // 'F'
                default {
                    valid := 0
                    break
                }
            }
        }

        require(valid, "illegal hash");

        return valid;
    }

    // stringToBytes32: Takes any string and returns it in 32 bytes hash
    function stringToBytes32 (
        string memory str
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }



        /////////////////////
       //  setter          /
      //  functions       /
     //  (non-IP)        /
    /////////////////////  

    // setNewOwner: A function that the owner can use to assign a new owner 
    function setNewOwner(
        address payable _new_owner
        ) 
    external ONLY_OWNER {
        owner = _new_owner;
    }

    // setFreeIpTokenwithdrawal: set the amount of Tokens that are freely dispensed as part of some functions
    function setFreeIpTokenwithdrawal(
        uint256 _amount
        ) 
    external ONLY_OWNER {
        freeIpTokenwithdrawal = _amount;
    }

    // setLockTime: set the locktime in seconds, for the faucet waiting time, or offer expiration period
    function setLockTime(
        uint256 _amount
        ) 
    external ONLY_OWNER {
        lockTime = _amount * 1 seconds;
    }

    // setIPCostIpt: set the cost for IP registration in IPT, paid to the contract owner
    function setIPCostIpt(
        uint256 _register,
        uint256 _transfer
    ) external ONLY_OWNER {
        //name it sales price
        registerIPCostIpt = _register;
        transferIPCostIpt = _transfer;
    }



       /////////////////////
      //   IPT transfer   /
     //  functions       /
    /////////////////////  

    // requestTokens: this is the contract's faucet
    function requestTokens() external nonReentrant {
        require(freeIpTokenwithdrawal > 0, "faucet closed");
        require(block.timestamp >= lastAccessTime[msg.sender] + lockTime, "try later");
        require(msg.sender != address(0), "request from 0");
        require(token.balanceOf(address(this)) >= freeIpTokenwithdrawal, "no IPT av");

        // set next access time
        lastAccessTime[msg.sender] = block.timestamp;

        // transfer
        token.transfer(msg.sender, freeIpTokenwithdrawal);

        // Emit TokensRequested event
        emit TokensRequested(msg.sender, freeIpTokenwithdrawal);
    }

    // depositIPT: this is an private function for tranfers of IPT based on allowance
     function depositIPT(
        uint256 _amount,
        address _payerAddress,
        address _receiver
    )  private  {

        // Checks
        require(token.balanceOf(_payerAddress) >= _amount, "No funds");
        require(token.allowance(_payerAddress, address(this)) >= _amount,  "No allowance"  );

        // Interaction
        token.transferFrom(_payerAddress, _receiver, _amount);
    }


    // recover IPT: move IPT out of the contract
    function unregisteredIPT() external ONLY_OWNER nonReentrant {
        uint256 totalIPTBalance = token.balanceOf(address(this));
        token.transfer(owner, totalIPTBalance);

        // Emit IPTWithdrawn event
        emit OwnerIPTWithdrawn(totalIPTBalance);
    }


       /////////////////////
      //   fallback       /
     //  functions       /
    /////////////////////  

    // depostit fallback functions to prevent sending Ether directy to the contract
    receive() external payable {
        revert(
            "Fallback function disabled. Transfer on allowance only."
        );
    }

    fallback() external payable {
        revert(
            "Fallback function disabled. Transfer on allowance only."
        );
    }



        /////////////////////
       //  IP registration /
      //  and transfer    /
     //  functions       /
    /////////////////////  


    // setIP:  The function to set the IP inside the contract
    // The IP holder should provide
    // - the SHA512
    // and approve the contract to transfer the fee on its behalf
    function setIP(
        string calldata str
        ) external nonReentrant {
        
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(!sha512s[sha512].exists, "is registered");

        // get paid
        depositIPT(registerIPCostIpt, msg.sender, owner); 

        // store the sha512 (key) to the address (value)
        sha512s[sha512].owner = msg.sender;
        sha512s[sha512].creationTimeStamp = uint96(block.timestamp);
        sha512s[sha512].exists = true;

        // Emit IPRegistered event
        emit IPRegistered(msg.sender, str);
    }


    // deleteIP: function to remobe an IP from the contract
    // Can be executed by the owner if the IP is not for sale
    function deleteIP(string calldata str) external {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);

        // should be owner of the IP
        require(sha512s[sha512].owner == msg.sender, "not owner");
        
        // IP cannot be for sale
        require (!onsale[sha512].exists, "IP is for sale");
        
        // delete the IP
        delete sha512s[sha512];

        // emit
         emit IpDeleted(msg.sender, str);

    }

    // sellerCreatesSalesIntent: the seller creates an onsale object to transfer the IP
    // The IP holder should provide
    // - the sha512 hash,
    // - the salesprice
    // - the address of the buyer
    // and approve the contract to transfer the fee on its behalf

    function sellerCreatesSalesIntent(
        string calldata str,
        uint192 salesPrice,
        address buyerAddress
    ) external nonReentrant {

        // you cannot sell to yourself
        require(buyerAddress != msg.sender, "don't sell to self");

        // needs to be the sha512 owner
        require(checkSha512(str));

        // check if exists and is owner
        bytes32 sha512 = stringToBytes32(str);
        require(!onsale[sha512].exists, "already for sale"); 
        require(sha512s[sha512].owner == msg.sender, "not owner");
        
        // get paid
        depositIPT(transferIPCostIpt, msg.sender, owner);
        
        // set the onsale instance
        onsale[sha512] = Onsale(
            buyerAddress,
            salesPrice,
            uint64(block.timestamp),
            true
        );

        // Emit
        emit SalesIntentCreated(msg.sender, str);
    }

    // sellerCancelsSalesIntent: a function to revoke the sales offer
    // It can only be successfully run when the time elapsed since creating the offer
    // has surpassed the lockTime
    function sellerCancelsSalesIntent(string calldata str) external {
        require(checkSha512(str));

        // needs to be the sha512 owner
        bytes32 sha512 = stringToBytes32(str);
        require(sha512s[sha512].owner == msg.sender, "not owner");
        require( block.timestamp > onsale[sha512].creationTimeStamp + lockTime,   "locked"   );
        require(onsale[sha512].exists, "Your ip is not for sale");

        // delete the sales intent
        delete onsale[sha512];

        // Emit
        emit SalesIntentCancelled(msg.sender, str);
    }

    // buyerBuysIP: the function to tranfer the IP to the buyer
    // The buyer runs this function with the following input:
    // - the salesprice, which should be the agreed sales price (remember that both coins have 18 decimals, meaning "1 equals 1*10-18 ETH or IPT")
    // - the sha512 hash
    // The money is transferred to the seller through the contract
    // Therefore, the sender must have approved the contract to transfer the negotiated price in IPT on its behalf

    function buyerBuysIP(
        string calldata str,
        uint192 salesPrice
    ) external nonReentrant {

        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(onsale[sha512].buyer_address == msg.sender, "not buyer, check sha512");
        require(onsale[sha512].salesPrice == salesPrice, "incorrect price");

        // check approval and balance
        require(token.allowance(msg.sender, address(this)) >= salesPrice,   "no allowance"  );
        require(token.balanceOf(msg.sender) >= salesPrice,   "no funds"   );

        // set temporary variable
        address prevOwner = sha512s[sha512].owner;

        // buyer pays seller 
        token.transferFrom(
            msg.sender,
            sha512s[sha512].owner,
            salesPrice
        );
    
        // transfer  virtually
        sha512s[sha512].owner = msg.sender;
        
        // set Onsale record to false
        delete onsale[sha512];

        // Emit events
        emit IPTransferred(
            prevOwner,
            msg.sender,
            str,
            salesPrice
        );
    }



       /////////////////////
      //   getter         /
     //  functions       /
    /////////////////////  

    // getIP: Check who is the owner of an IP, need to provide the MD5sum
    function getIP(
        string calldata str) 
    external view returns (IPowner memory) {
        require(checkSha512(str));
        bytes32 sha512 = stringToBytes32(str);
        require(sha512s[sha512].exists, "IP does not exist");
        return
            IPowner(
                sha512s[sha512].owner,
                sha512s[sha512].creationTimeStamp,
                sha512s[sha512].exists
            );
    }

    // getSalesIntent: Function check if an MD5sum is on sale, need to provide an MD5sum
    function getSalesIntent(
        string calldata str
    ) external view returns (Onsale memory) {
        bytes32 sha512 = stringToBytes32(str);
        require(onsale[sha512].exists, "Not for sale");
        return
            Onsale( 
                onsale[sha512].buyer_address,
                onsale[sha512].salesPrice,
                onsale[sha512].creationTimeStamp,
                onsale[sha512].exists
            );
    }



      /////////////////////
     //  Modifiers       /
    /////////////////////  

    //__ONLY_OWNER 
    modifier ONLY_OWNER() {
        require(
            msg.sender == owner, 
            "owner only"
        );
        _;
    }
}
