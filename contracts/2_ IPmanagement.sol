// SPDX-License-Identifier: MIT
// contracts/IPmanagement.sol
/*

- [ ] get a receipt of all transactions

IPTs will remain to be traded. 
// can owner get IPT back with simple tranfer function?
// can owner get ETH back with simple tranfer function?
// users should never send IPT tokens directly to the contract. Use allowance and then "contractReceivesCredit"
// what happens to Ether in contract if transactions are made, how to make sure there is always enough?
// getethercridt vs getIPTbalance - change
// now the seller has to deposit ETH if they sell in ETH, and has to deposit IPT if selling in IPT. Is that an issue?
*/


pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";


interface IERC20{
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract IPtrade{

    /* 
    token variables
    */
    address payable public owner;
    IERC20 public token;
    uint256 public initialTime;

    /* 
    public variables
    */
    uint256 private freeIpTokenwithdrawal = 1 * (10 ** 18); // set?
    uint256 private registerIPCostIpt     = 1 * (10 ** 18); // set?
    uint256 private transferIPCostIpt     = 2 * (10 ** 18); // set?
    uint256 private registerIPCostEth     = 0.001 * (10 ** 18);  // set?
    uint256 private transferIPCostEth     = 0.002 * (10 ** 18);  // set?
    uint256 private lockTime              = 604800 seconds; // set?
    bool    private provideFreeTokens     = true;
    bool    private ownershipRenounced    = false;
    uint256 private spentEtherOdometer    = 0; // private or public?
    uint256 private spentEtherTotal       = 0;
    uint256 private ethersInContract      = 0;
    uint256 private spentIptOdometer      = 0; 
    uint256 private spentIptTotal         = 0;
    uint256 private iptInContract         = 0;


    /* 
    events
    */
    event Withdrawal(address indexed to, uint256 indexed amount);
    event Deposit(address indexed from, uint256 indexed amount);

    /*
    structs
    */
    struct IPowner {
        address owner;
        uint256 creationTimeStamp;
        bool    exists;
    }

    struct Onsale {
        address owner_address;
        address buyer_address;
        bool    isEther;
        uint256 salesPrice; 
        uint    creationTimeStamp;
        bool    exists;
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
    }

    /*
    translate variables helper functions
    */
    //__md5Length tested
    function checkMd5Length(string memory str) public pure returns (bool){
        bytes memory stringInBytes = bytes(str);
        uint256 strLength = stringInBytes.length;
        require (strLength == 32, "md5 incorr");
        return true;
    }

    //__stringToBytes32 tested
    function stringToBytes32(string memory str) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    /* 
    setter and getter variable functions, simple variables
    */
    //__WithdrawalAmount 
    //set tested
    function setWithdrawalAmount(uint256 amount) external onlyOwner{
        freeIpTokenwithdrawal = amount;
    }
    //get tested
    function getWithdrawalAmount() external view returns (uint256){
        return freeIpTokenwithdrawal;
    }

    //__LockTime 
    //set tested
    function setLockTime(uint256 amount) external onlyOwner{
        lockTime = amount * 1 seconds;
    }
    //get tested
     function getLockTime() external view onlyOwner returns (uint256){
        return lockTime;
    }

    //__FreetokensBool
    //set tested
    function setFreetokensBool (bool provide) external onlyOwner{
        provideFreeTokens = provide;
    }
    //get tested
    function getFreetokensBool() external view onlyOwner returns (bool){
        return (provideFreeTokens);
    }

    //__IptRegistrationPrice
    //set tested
    function setIptRegistrationPrice(uint256 amount) external onlyOwner{ //name it sales price
        registerIPCostIpt = amount;
    }
    //get tested
    function getIptRegistrationPrice() external view returns (uint256) { //name it sales price
        return registerIPCostIpt;
    }

    //__IptTransferPrice
    //set tested
    function setIptTransferPrice(uint256 amount) external onlyOwner {
        transferIPCostIpt = amount;
    }
    //get tested
    function getIptTransferPrice() external view returns (uint256) {
        return transferIPCostIpt;
    }

    //__EthRegistrationPrice
    //set tested
    function setEthRegistrationPrice(uint256 amount) external onlyOwner { //name it sales price
        registerIPCostEth = amount;
    }

    //get tested
    function getEthRegistrationPrice() external view returns (uint256) { //name it sales price
        return registerIPCostEth;
    }

    //__EthTransferPrice
    //set tested
    function setEthTransferPrice(uint256 amount) external onlyOwner{
        transferIPCostEth = amount;
    }
    //get tested
    function getEthTransferPrice() external view returns (uint256) {
        return transferIPCostEth;
    }

    /*
    getter functions for variables set through usage
    */
    //__EtherCredit
    //get tested
    function getEtherCredit() external view returns (uint256){
        return etherCredit[msg.sender];
    }

    //__iptInContract
    function getIptInContract() external view onlyOwner returns (uint256){
        return iptInContract;
    } 

    //__ethersInContract tested
    function getEthersInContract() external view onlyOwner returns (uint256){
        return ethersInContract;
    }

    //__IP
    //get tested
    function getIP(string calldata str) external view returns (IPowner memory) {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        return IPowner(md5s[md5].owner, md5s[md5].creationTimeStamp, md5s[md5].exists);
    }

    //__salesIntent
    // get
    function getSalesIntent(string calldata str) external view returns (Onsale memory) {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        return Onsale(onsale[md5].owner_address, onsale[md5].buyer_address, onsale[md5].isEther, onsale[md5].salesPrice, onsale[md5].creationTimeStamp, onsale[md5].exists);
    }

    //__IpTransactions
    //get 
    function getIpTransactions(string calldata str) external view returns (address[] memory) {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        return md5sTransactions[md5];
    }

    //__AccountBalance
    //get tested
    function getIptBalance() external view returns (uint256){
        return (iptBalances[msg.sender]);
    }

    //__SpentIptOdometer
    //get tested
    function getSpentIptOdometer() external view onlyOwner returns (uint256) {
        return spentIptOdometer;
    }
    
    //__SpentIptTotal
    //get tested
    function getSpentIptTotal() external view onlyOwner returns (uint256) {
        return spentIptTotal;
    }

    //__SpentEthOdometer
    //get tested
    function getSpentEthOdometer() external view onlyOwner returns (uint256) {
        return spentEtherOdometer;
    }
    
    //__SpentEthTotal
    //get tested
    function getSpentEthTotal() external view onlyOwner returns (uint256) {
        return spentEtherTotal;
    }

    /* 
    transfer functions
    */

    //__requestTokens, a faucet function      tested, except address(0)
    function requestTokens() external{
        // check
        require(msg.sender != address(0), "request from 0");  
        require(provideFreeTokens == true, "faucet closed");
        require(token.balanceOf(address(this)) >= freeIpTokenwithdrawal, "no IPT av");
        require(block.timestamp >= nextAccessTime[msg.sender], "try later");
        // set next access time
        nextAccessTime[msg.sender] = block.timestamp + lockTime;
        // transfer
        token.transfer(msg.sender, freeIpTokenwithdrawal);
    }

    //__contractReceivesCredit  tested
    // essential function for tranfers of IPT based on allowance
    function contractReceivesCredit(uint256 amount, address selfAddress) public payable  {
        // check
        require(token.balanceOf(selfAddress) >= amount, "No funds");
        require(token.allowance(selfAddress, address(this)) >= amount , "No allowance");
        // collect the amount
        token.transferFrom(selfAddress, address(this), amount);
        iptBalances[msg.sender] += amount;
        iptInContract += amount;
    }

    //__deposit, tested
    // a function to store Ether in the contract
    function deposit() external payable {  
        require(msg.value > 0, "not allow 0");
        etherCredit[msg.sender] += msg.value;
        ethersInContract += msg.value;
   }

    //__receive tested
    // the fallback option to store Ether in the contract
    receive() external payable{
        require(msg.value > 0, "not allow 0");
        emit Deposit(msg.sender, msg.value);
        etherCredit[msg.sender] += msg.value;  // not ethercredit
        ethersInContract += msg.value;
    }

    //__userSomeEtherWithdrawal tested
    // user can withdraw some Ether
    function userSomeEtherWithdrawal(uint256 amount) external payable {
        require (etherCredit[msg.sender] >= amount, "no IPT");
        etherCredit[msg.sender] -= amount;
        payable(msg.sender).transfer(amount); 
        ethersInContract -= amount;
    }

    //__userAllEtherWithdrawal tested
    // user can withdraw all Ether 
    function userAllEtherWithdrawal() external payable {
        require (etherCredit[msg.sender] > 0, "no ETH");
        uint256 amount = etherCredit[msg.sender];
        etherCredit[msg.sender] = 0;
        payable(msg.sender).transfer(amount); 
        ethersInContract -= amount;
    }

    //__userSomeIptWithdrawal tested
    // user can withdraw some IPT
    function userSomeIptWithdrawal(uint256 amount) external {
        require(iptBalances[msg.sender] >= amount, "no IPT");
        iptBalances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
        iptInContract -= amount;
    }

    //__userAllIptWithdrawal tested
    // user can withdraw all IPT
    function userAllIptWithdrawal() external {
        require(iptBalances[msg.sender] > 0, "no IPT");
        uint256 amount = iptBalances[msg.sender];
        iptBalances[msg.sender] = 0;
        token.transfer(msg.sender, amount);
        iptInContract -= amount;
    }

    //__withdrawSpentEth tested
    // owner can withdraw spent Ether
    function withdrawSpentEth() external onlyOwner{
        require(spentEtherOdometer > 0, "no ETH");
        emit Withdrawal(owner, spentEtherOdometer);
        owner.transfer(spentEtherOdometer);
        ethersInContract -= spentEtherOdometer;
        spentEtherOdometer = 0;
    }

    //__withdrawSpentCoins tested
    // owner can withdraw spent coins
    function withdrawSpentIpt() external onlyOwner{
        require(spentIptOdometer > 0, "no IPT");
        token.transfer(owner, spentIptOdometer);
        iptInContract -= spentIptOdometer;
        spentIptOdometer = 0;
    }

    /*
    IP registration and transfer functions
    */
    //__setIP tested
    function setIP(string calldata str, bool onApproval, bool isEther) external {
        require(!(onApproval && isEther), "cant approve ETH");
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require(md5s[md5].exists == false, "is registered" ); 
        if (isEther == false){
            if(onApproval == false){
                // check credits
                require(iptBalances[msg.sender] >= registerIPCostIpt, "no IPT");

                // register credit    
                iptBalances[msg.sender] -= registerIPCostIpt;
                spentIptOdometer        += registerIPCostIpt;
                spentIptTotal           += registerIPCostIpt;
            }
            if(onApproval == true){
      
                // get paid
                contractReceivesCredit(registerIPCostIpt, msg.sender);  // this function checs allowance and balance

                // register credit    
                iptBalances[msg.sender] -= registerIPCostIpt;
                spentIptOdometer        += registerIPCostIpt;
                spentIptTotal           += registerIPCostIpt;
            }
        } 
        if (isEther == true){
            // check credits
            require(etherCredit[msg.sender]>= registerIPCostEth, "no ETH");

            // remove credit    
            etherCredit[msg.sender] -= registerIPCostEth;
            spentEtherOdometer      += registerIPCostEth;
            spentEtherTotal         += registerIPCostEth;
        }
        // store the md5 (key) to the address (value)
        md5s[md5].owner             =  msg.sender; 
        md5s[md5].creationTimeStamp = block.timestamp;
        md5s[md5].exists = true;
        md5sTransactions[md5].push(msg.sender);
    }

    //__sellerCreatesSalesIntent tested
    // The seller has agreed wit a buyer and now creates an onsale object to transfer the IP
    function sellerCreatesSalesIntent (string calldata str, uint256 salesPrice, address buyerAddress, bool onApproval, bool isEther) external{
        // needs to be the md5 owner
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require (md5s[md5].owner != address(0), "ip not exist");
        require (md5s[md5].owner == msg.sender, "not owner");
        require (!(onApproval && isEther), "cant approve ETH");
        require (onsale[md5].exists == false, "not exists or for sale");  // still need to test


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
            spentIptTotal += transferIPCostIpt;
        }
        if (isEther == true){
            // check credits
            require(etherCredit[msg.sender]>= transferIPCostEth, "no ETH");
            // remove credit    
            etherCredit[msg.sender] -= transferIPCostEth;
            spentEtherOdometer += transferIPCostEth;
            spentEtherTotal += transferIPCostEth;
        }
        // set the onsale instance
        onsale[md5]= Onsale(msg.sender, buyerAddress, isEther, salesPrice, block.timestamp, true);
    }  
    

    //__sellerCancelsSalesIntent   tested
    function sellerCancelsSalesIntent(string calldata str) external {
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
    }

    //__buyerBuysIP  tested_almost
    function buyerBuysIP(uint256 salesPrice, string calldata str, bool onApproval,  bool isEther) external {
        require(checkMd5Length(str));
        bytes32 md5 = stringToBytes32(str);
        require (!(onApproval && isEther), "cant approve ETH");
        require(onsale[md5].buyer_address ==  msg.sender, "not buyer");
        require(onsale[md5].salesPrice == salesPrice, "incorrect price");
        require(isEther == onsale[md5].isEther, "wrong currency");
        require (block.timestamp < onsale[md5].creationTimeStamp + lockTime, "expired");

        if (onsale[md5].isEther == false){
            if (onApproval == false){
                // check acount balance
                require (iptBalances[msg.sender] >= salesPrice);
                require (iptInContract          >= salesPrice); // coins available in contract
                // transfer the coins to the seller
                iptBalances[msg.sender]  -= salesPrice;
                iptInContract -= salesPrice;
                token.transfer(onsale[md5].owner_address, salesPrice);
            }
            if (onApproval == true){
                // check approval
                require (token.allowance(msg.sender, onsale[md5].owner_address) >= salesPrice, "no allowance");
                require (token.balanceOf(msg.sender) >= salesPrice, "no funds");
                // get paid
                token.transferFrom(msg.sender, onsale[md5].owner_address, salesPrice);
            }
        }
        if (onsale[md5].isEther == true){
            require(etherCredit[msg.sender]>= salesPrice, "no funds");
            require(ethersInContract >= salesPrice,  "no ETH here");
            address currentOwner = md5s[md5].owner;

            // remove credit    
            etherCredit[msg.sender] -= salesPrice;
            etherCredit[currentOwner] += salesPrice;
            ethersInContract -= salesPrice;
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
    }

    modifier onlyOwner(){
        require( msg.sender == owner, "owner only");
        _;
    }
}



