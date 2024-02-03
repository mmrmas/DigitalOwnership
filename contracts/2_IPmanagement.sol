// SPDX-License-Identifier: MIT
// contracts/IPmanagement.sol

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; //tested

interface IERC20{
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract IPtrade is ReentrancyGuard{
    /* 
    token variables
    */
    address payable public owner;
    address public ONLY_OWNERHelper;
    IERC20 public token;

    /* 
    public variables
    */
    uint256 public  freeIpTokenwithdrawal  = 100 * (10 ** 18); 
    uint256 public  registerIPCostIpt      = 100 * (10 ** 18);
    uint256 public  transferIPCostIpt      = 200 * (10 ** 18); 
    uint256 public  registerIPCostEth      = 0.001 * (10 ** 18);  
    uint256 public  transferIPCostEth      = 0.002 * (10 ** 18);  
    uint256 public  lockTime               = 604800 seconds; 
    bool    public  freeTokensBool         = true;
    uint256 public  spentEtherOdometer     = 0;
    uint256 public  ethersInContract       = 0;   // keeps track on ETH expenses and reducts from user accounts 
    uint256 public  spentIptOdometer       = 0;   // keeps track on IPT expenses and reducts from user accounts 
    uint256 public  iptInContract          = 0;


    /* 
    events
    */
    event ETHWithdrawal(address indexed to, uint256 indexed amount);
    event IPTWithdrawal(address indexed to, uint256 indexed amount);
    event EtherReceived(address indexed from, uint256 amount);
    event IPTReceived(address from, uint256 amount);
    event IPRegistered(address indexed owner, bytes32 indexed ipHash);
    event SalesIntentCreated(address indexed seller, bytes32 indexed ipHash, uint256 salesPrice, address indexed buyer, bool isEther);
    event SalesIntentCancelled(address indexed seller,  bytes32 indexed ipHash);
    event IPTransferred(address indexed from, address indexed to, bytes32 indexed ipHash, bool isEther, uint256 amount);
    event TokensRequested(address indexed requester, uint256 amount);
    // Ether withdrawn by owner
    event OwnerEtherWithdrawn(address indexed to, uint256 amount); 
     // IPT withdrawn by owner
    event OwnerIPTWithdrawn(address indexed to, uint256 amount);
    
    /*
    structs
    */
    // This struct contains data about IP owners
    struct IPowner {
        bool    exists;
        address owner;
        uint256 creationTimeStamp;

    }

    // This struct contains data about IP on offer / for sale
    struct Onsale {
        bool    exists;
        bool    isEther;
        address owner_address;
        address buyer_address;
        uint256 salesPrice; 
        uint    creationTimeStamp;
    } 

    /* 
    mappings
    */
    mapping(address => uint256) private iptBalances;  
    mapping(address => uint)    private etherCredit;   
    mapping(bytes32 => IPowner) private md5s;   
    mapping(bytes32 => address[]) private md5sTransactions;  
    mapping(address => uint256) private nextAccessTime;
    mapping(bytes32 => Onsale)  private onsale;

    /*
    constructor
    */
    constructor(address tokenAddress) payable{
        token = IERC20(tokenAddress);
        owner = payable(msg.sender);
        ONLY_OWNERHelper = payable(msg.sender);
    }

    /*
    translate variables ONLY_OWNERHelper functions
    */
    // checkMd5Length 
    // Takes a string and reports if it is 32 bytes
    function checkMd5Length(string memory str) internal pure returns (bool){
        bytes memory stringInBytes = bytes(str);
        uint256 strLength = stringInBytes.length;
        require (strLength == 32, "md5 incorr");
        return true;
    }

    // stringToBytes32 
    // Takes a string and returns it in32 bytes 
    function stringToBytes32(string memory str) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    /* 
    setter and getter variable functions, simple variables
    */
    // setHelper
    // A function that the owner can use to assign a secondary owner with control over functions
    function setHelper(address _ONLY_OWNERHelper) external ONLY_OWNER{
        ONLY_OWNERHelper = _ONLY_OWNERHelper;
    }

    // setFreeIpTokenwithdrawal 
    // set the amount of Tokens that are freely dispensed as part of some functions
    function setFreeIpTokenwithdrawal(uint256 amount) external ONLY_OWNER{
        freeIpTokenwithdrawal = amount;
    }


    // setLockTime 
    // set the locktime in seconds, for the faucet waiting time, or offer expiration period 
    function setLockTime(uint256 amount) external ONLY_OWNER{
        lockTime = amount * 1 seconds;
    }


    // setFreetokensBool
    // A bool to open or close the faucet, accepts true or false
    function setFreetokensBool (bool _freeTokensBool) external ONLY_OWNER{
        freeTokensBool = _freeTokensBool;
    }
 

    // setIPCostIpt
    // set the cost for IP registration in IPT, paid to the contract owner
    function setIPCostIpt(uint256 register, uint256 transfer) external ONLY_OWNER{ //name it sales price
        registerIPCostIpt = register;
        transferIPCostIpt = transfer;
    }


    // setIPCostEth 
    // set the cost for IP registration in ETH, paid to the contract owner
    function setIPCostEth(uint256 register, uint256 transfer) external ONLY_OWNER { //name it sales price
        registerIPCostEth = register;
        transferIPCostEth = transfer;    
    }

    /*
    getter functions for state variables set through usage
    */
    // getEtherCredit
    // get the sender's credit in ETH in the contract
    function getEtherCredit() external view returns (uint256){
        return etherCredit[msg.sender];
    }

    // getIP
    // Check who is the owner of an IP, need to provide the MD5sum
    function getIP(string calldata str) external view returns (IPowner memory) {
        bytes32 md5 = stringToBytes32(str);
        return IPowner( md5s[md5].exists, md5s[md5].owner, md5s[md5].creationTimeStamp);
    }

    // getSalesIntent
    // Function check if an MD5sum is on sale, need to provide an MD5sum
    function getSalesIntent(string calldata str) external view returns (Onsale memory) {
        bytes32 md5 = stringToBytes32(str);
        return Onsale(onsale[md5].exists, onsale[md5].isEther, onsale[md5].owner_address, onsale[md5].buyer_address, onsale[md5].salesPrice, onsale[md5].creationTimeStamp);
    }

    // getIpTransactions
    // follow which addresses an MD5sum has belonged to, returns an array where the current owner is the last address
    function getIpTransactions(string calldata str) external view returns (address[] memory) {
        bytes32 md5 = stringToBytes32(str);
        return md5sTransactions[md5];
    }

    // getIptBalance
    // users can use this function to check their IPT credit in the contract
    function getIptBalance() external view returns (uint256){
        return (iptBalances[msg.sender]);
    }

    /* 
    transfer functions
    */
    // requestTokens
    // this is the contract's faucet
    function requestTokens() external nonReentrant {
        require(freeTokensBool      == true, "faucet closed");
        require(block.timestamp     >= nextAccessTime[msg.sender], "try later");
        require(msg.sender          != address(0), "request from 0");  
        require(iptBalances[owner]  >= freeIpTokenwithdrawal, "no IPT av");
        
        // set next access time
        nextAccessTime[msg.sender] = block.timestamp + lockTime;
        
        // transfer
        token.transfer(msg.sender, freeIpTokenwithdrawal);
        iptInContract       -= freeIpTokenwithdrawal;
        iptBalances[owner]  -= freeIpTokenwithdrawal;
         
        // Emit TokensRequested event
        emit TokensRequested(msg.sender, freeIpTokenwithdrawal);
    }


    // depositIPT
    // This is an essential function for tranfers of IPT based on allowance
    // IF users desire to pay from credit insted of allowance, they can tranfer 
    // IPT into the contract through this function
    function depositIPT(uint256 amount) external payable nonReentrant {
        // Checks
        require(token.balanceOf(msg.sender) >= amount, "No funds");    
        require(token.allowance(msg.sender, address(this)) >= amount, "No allowance");

        // Interaction
        token.transferFrom(msg.sender, address(this), amount);

        // Effects
        iptBalances[msg.sender] += amount;
        iptInContract           += amount;

        // Event Emission
        emit IPTReceived(msg.sender, amount);
    }



    // contractReceivesCredit
    // This is an internal function for tranfers of IPT based on allowance
    function contractReceivesCredit(uint256 amount, address payerAddress) private  {
        // Checks
        require(token.balanceOf(payerAddress) >= amount, "No funds");    
        require(token.allowance(payerAddress, address(this)) >= amount, "No allowance");

         // Interaction
        token.transferFrom(payerAddress, address(this), amount);

        // Effects
        iptBalances[payerAddress] += amount;
        iptInContract += amount;

        // Event Emission
        emit IPTReceived(payerAddress, amount);
    }

    // deposit
    // The required function to store Ether in the contract
    function deposit() external payable nonReentrant{  
        require(msg.value > 0, "not allow 0");

        // write ether to user account
        etherCredit[msg.sender] += msg.value;
        ethersInContract += msg.value;

        // Eent emission
        emit EtherReceived(msg.sender, msg.value);
   }

    // fallback functions
    // the fallback option to prevent sending Ether directy to the contract
    receive() external payable {
        revert("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
    }
    fallback() external payable {
        revert("Fallback function disabled. Use deposit() for Ether or depositIPT() for IPT.");
    }

    // userEtherWithdrawal
    // A function for users to withdraw (part of) their Ether credit
    function userEtherWithdrawal(uint256 amount) external payable nonReentrant {
        require (etherCredit[msg.sender] >= amount, "no ETH");

        // pay and adjust credit
        etherCredit[msg.sender] -= amount;
        payable(msg.sender).transfer(amount); 

        // adjust Ether in contract
        ethersInContract -= amount;

        // Emit the Withdrawal event with the amount
        emit ETHWithdrawal(msg.sender, amount);
    }

    // userIptWithdrawal
    // A function for users to withdraw (part of) their IPT credit
    function userIptWithdrawal(uint256 amount) external nonReentrant {
        require(iptBalances[msg.sender] >= amount, "no IPT");

        // pay and adjust credit
        iptBalances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);

        // adjust ipt contract
        iptInContract -= amount;

        // Emit the Withdrawal event with the amount
        emit IPTWithdrawal(msg.sender, amount);
    }

    // withdrawSpentEth
    // A function for the owner(helper) to withdraw all ETH that is earned from IP registrations to the owner address
    function withdrawSpentEth() external ONLY_OWNER nonReentrant{
        require(spentEtherOdometer > 0, "no ETH");

        ethersInContract -= spentEtherOdometer;
        owner.transfer(spentEtherOdometer);
        spentEtherOdometer = 0;
     
        // Emit EtherWithdrawn event
        emit OwnerEtherWithdrawn(owner, spentEtherOdometer);

    }

    // withdrawSpentIpt
    // A function for the owner(helper) to withdraw all IPT that is earned from IP registrations to the owner address
    // owner withdraws spent IPT and a potential surplus of IPT (when not transferred through depositIPT())
    function withdrawSpentIpt() external ONLY_OWNER nonReentrant{
        
        // set local transferNow varaible
        uint256 transferNow = spentIptOdometer;

        // also get the unregistered IPT back (transferred for Faucet)
        uint256 totalIPTBalance = token.balanceOf(address(this));
        if (totalIPTBalance - iptInContract > 0){
            transferNow = transferNow + totalIPTBalance - iptInContract;
        }
        require(transferNow > 0, "no IPT");
        iptInContract -= spentIptOdometer;
        token.transfer(owner, transferNow);
        spentIptOdometer = 0;

        // Emit IPTWithdrawn event
        emit OwnerIPTWithdrawn(owner, transferNow);
    }


    /*
    IP registration and transfer functions
    */
    // setIP
    // The function to set the IP inside the contract/

    // The IP holder should provide 
    // - the MD5sum, 
    // - a true/false if the registration is paid on IPT approval, 
    // - and a true/false if teh registration is paid in ETH
    //
    // If onApproval is true, the payment cannot be done in ETH
    // If onApproval is true, the IP holder should have approved the payment through the IPT apporval function:
    // ipToken.connect(IP-HOLDER-ADDRESS).approve(IPTRADE-ADDRESS, REGISTRATION FEE);
    function setIP(string calldata str, bool onApproval, bool isEther) external nonReentrant {
        require(!(onApproval && isEther), "cant approve ETH");
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require(md5s[md5].exists == false, "is registered" ); 
        if (isEther == false){
            if(onApproval == false){  // on credit in contract
                // check credits
                require(iptBalances[msg.sender] >= registerIPCostIpt, "no IPT");

                // register credit    
                iptBalances[msg.sender] -= registerIPCostIpt;
                spentIptOdometer        += registerIPCostIpt;
            }
            if(onApproval == true){
      
                // get paid
                contractReceivesCredit(registerIPCostIpt, msg.sender);  // this function checs allowance and balance

                // register credit    
                iptBalances[msg.sender] -= registerIPCostIpt;
                spentIptOdometer        += registerIPCostIpt;
            }
        } 
        if (isEther == true){
            // check credits
            require(etherCredit[msg.sender]>= registerIPCostEth, "no ETH");

            // remove credit    
            etherCredit[msg.sender] -= registerIPCostEth;
            spentEtherOdometer      += registerIPCostEth;
        }
        // store the md5 (key) to the address (value)
        md5s[md5].exists            = true;
        md5s[md5].owner             =  msg.sender; 
        md5s[md5].creationTimeStamp = block.timestamp;
        md5sTransactions[md5].push(msg.sender);

        // provide free tokens
        if(freeTokensBool      == true){
            if (iptBalances[owner]  >= freeIpTokenwithdrawal){
                token.transfer(msg.sender, freeIpTokenwithdrawal);
                iptInContract       -= freeIpTokenwithdrawal;
                iptBalances[owner]  -= freeIpTokenwithdrawal;
                emit TokensRequested(msg.sender, freeIpTokenwithdrawal);
            }
        }

        // Emit IPRegistered event
        emit IPRegistered(msg.sender, md5);
    }

    // sellerCreatesSalesIntent
    // The seller has agreed with a buyer and now creates an onsale object to transfer the IP
    // They use this function for this

    // The IP holder should provide 
    // - the MD5sum, 
    // - the sales price in IPT or ETH (remember that both coins have 18 decimals, meaning "1 equals 1*10-18 ETH or IPT")
    // - the address of the buyer
    // - a true/false if the IP transfer is paid on IPT approval, 
    // - and a true/false if IP transfer is paid in ETH

    // It is important to note that the currency for the sales price (which will go from buyer to seller) 
    // is the same as the currency for the transfer (which will go from seller to the contract owner)
    //
    // If onApproval is true, the payment cannot be done in ETH
    // If onApproval is true, the IP holder should have approved the payment through the IPT apporval function:
    // ipToken.connect(IP-HOLDER-ADDRESS).approve(IPTRADE-ADDRESS, REGISTRATION FEE);


    function sellerCreatesSalesIntent (string calldata str, uint256 salesPrice, address buyerAddress, bool onApproval, bool isEther) external nonReentrant {
        // needs to be the md5 owner
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require (md5s[md5].owner != address(0), "ip not exist");
        require (md5s[md5].owner == msg.sender, "not owner");
        require (!(onApproval && isEther),      "cant approve ETH");
        require (onsale[md5].exists == false,   "not exists or for sale");  // still need to test


        // prepare coin check and transfer payment paid by current owner
        if (isEther == false){
            if (onApproval == false){
                // check acount balance
                require(iptBalances[msg.sender] >= transferIPCostIpt, "no IPT");
            }
            if (onApproval == true){
                // check approval
                require (token.allowance(msg.sender, address(this)) >= transferIPCostIpt, "No allowance");
                // get paid
                contractReceivesCredit(transferIPCostIpt, msg.sender); 
                // check acount balance
                require(iptBalances[msg.sender] >= transferIPCostIpt);
            }
            // remove credit   
            iptBalances[msg.sender] -= transferIPCostIpt;
            spentIptOdometer += transferIPCostIpt;
        }
        if (isEther == true){
            // check credits
            require(etherCredit[msg.sender]>= transferIPCostEth, "no ETH");

            // remove credit    
            etherCredit[msg.sender] -= transferIPCostEth;
            spentEtherOdometer += transferIPCostEth;
        }
        // set the onsale instance
        onsale[md5]= Onsale(true, isEther, msg.sender, buyerAddress, salesPrice, block.timestamp);

        // Emit SalesIntentCreated event
        emit SalesIntentCreated(msg.sender, md5, salesPrice, buyerAddress, isEther);
    }  
    

    // sellerCancelsSalesIntent   
    // A function to revoke the sales offer
    // It can only be successfully run when the time elapsed since creating the offer
    // has surpassed the lockTime
    function sellerCancelsSalesIntent(string calldata str) external  {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        // needs to be the md5 owner
        require (md5s[md5].owner == msg.sender, "not owner");
        require (block.timestamp > onsale[md5].creationTimeStamp + lockTime, "locked");
        require (onsale[md5].exists == true, "Your ip is not for sale");
        // delete the sales intent
        onsale[md5].owner_address = address(0);
        onsale[md5].buyer_address = address(0);
        onsale[md5].isEther = false;
        onsale[md5].salesPrice = 0;
        onsale[md5].creationTimeStamp = 0;
        onsale[md5].exists = false;

        // Emit SalesIntentCancelled event
        emit SalesIntentCancelled(msg.sender, md5);
    }

    // buyerBuysIP 
    // The function to tranfer the IP to the buyer
    // The buyer runs this function with the following input:
    // 
    // - the salesprice, which should be the agreed sales price (remember that both coins have 18 decimals, meaning "1 equals 1*10-18 ETH or IPT")
    // - the MD5sum
    // - a true/false if the IP transfer is paid on IPT approval, 
    // - and a true/false if IP transfer is paid in ETH

    // If onApproval is true, the payment cannot be done in ETH
    // If onApproval is true, the IP holder should have approved the payment through the IPT apporval function:
    // ipToken.connect(IP-HOLDER-ADDRESS).approve(IPTRADE-ADDRESS, REGISTRATION FEE);

    // The money is trabnferred to the seller through the contract

    function buyerBuysIP(string calldata str, uint256 salesPrice, bool onApproval, bool isEther) external nonReentrant {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require (!(onApproval && isEther), "cant approve ETH");
        require(onsale[md5].buyer_address ==  msg.sender, "not buyer");
        require(onsale[md5].salesPrice == salesPrice, "incorrect price");
        require(isEther == onsale[md5].isEther, "wrong currency");

        if (onsale[md5].isEther == false){
            if (onApproval == false){
                // check acount balance
                require (iptBalances[msg.sender] >= salesPrice);
                require (iptInContract          >= salesPrice); // coins available in contract
                // transfer the coins to the seller
                iptBalances[msg.sender]         -= salesPrice;
                iptInContract                   -= salesPrice;
                token.transfer(onsale[md5].owner_address, salesPrice);
            }
            if (onApproval == true){
                // check approval
                require (token.allowance(msg.sender, address(this)) >= salesPrice, "no allowance");
                require (token.balanceOf(msg.sender) >= salesPrice, "no funds");
                // get paid
                token.transferFrom(msg.sender, onsale[md5].owner_address, salesPrice);
            }
        }
        if (onsale[md5].isEther == true){
            require(etherCredit[msg.sender]>= salesPrice, "no funds");
            require(ethersInContract >= salesPrice,  "no ETH here");
            address payable currentOwner = payable(md5s[md5].owner);

            // transfer
             currentOwner.transfer(salesPrice);

            // remove credit    
            etherCredit[msg.sender]   -= salesPrice;
            ethersInContract          -= salesPrice;
        }

        // transfer ether virtually 
        md5s[md5].owner =  msg.sender;
        md5sTransactions[md5].push(msg.sender);
        onsale[md5].owner_address = address(0);
        onsale[md5].buyer_address = address(0);
        onsale[md5].isEther = false;
        onsale[md5].salesPrice = 0;
        onsale[md5].creationTimeStamp = 0;
        onsale[md5].exists = false;

        // provide free tokens
        if(freeTokensBool      == true){
            if (iptBalances[owner]  >= freeIpTokenwithdrawal){
                token.transfer(msg.sender, freeIpTokenwithdrawal);
                iptInContract       -= freeIpTokenwithdrawal;
                iptBalances[owner]  -= freeIpTokenwithdrawal;
                emit TokensRequested(msg.sender, freeIpTokenwithdrawal);
            }
        }

        // Emit events
        emit IPTransferred(onsale[md5].owner_address, msg.sender, md5, onsale[md5].isEther, salesPrice);
    }

    //__ONLY_OWNER and helper tested
    modifier ONLY_OWNER(){
        require( msg.sender == owner || msg.sender == ONLY_OWNERHelper, "owner or helper only");
        _;
    }
}