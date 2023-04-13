// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

interface Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (uint256);    
}

contract Staking is Pausable, Ownable, ReentrancyGuard {

    Token hroToken;

    // 30 Дней (30 * 24 * 60 * 60)
    uint256 public planDuration = 2592000;

    // 180 Дней (180 * 24 * 60 * 60)
    uint256 _planExpired = 15552000;

    bool private _notEntered;

    modifier nonReentrant() {
        require(_notEntered, "Reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }

    uint8 public interestRate = 32;
    uint256 public planExpired;
    uint8 public totalStakers;

    struct StakeInfo {        
        uint256 startTS;
        uint256 endTS;        
        uint256 amount; 
        uint256 claimed;       
    }
    
    event Staked(address indexed from, uint256 amount);
    event Claimed(address indexed from, uint256 amount);
    
    mapping(address => StakeInfo) public stakeInfos;
    mapping(address => bool) public addressStaked;


    constructor(Token _tokenAddress) {
        require(address(_tokenAddress) != address(0),"Token Address cannot be address 0");                
        hroToken = _tokenAddress;        
        planExpired = block.timestamp + _planExpired;
        totalStakers = 0;
    }    

    function transferToken(address to,uint256 amount) external onlyOwner{
        require(hroToken.transfer(to, amount), "Token transfer failed!");  
    }

    function claimReward() external nonReentrant returns (bool){
        require(addressStaked[_msgSender()] == true, "You are not participated");
        require(stakeInfos[_msgSender()].endTS < block.timestamp, "Stake Time is not over yet");
        require(stakeInfos[_msgSender()].claimed == 0, "Already claimed");

        uint256 stakeAmount = stakeInfos[_msgSender()].amount;
        uint256 totalTokens = stakeAmount + (stakeAmount * interestRate / 100);
        stakeInfos[_msgSender()].claimed = totalTokens;
        hroToken.transfer(_msgSender(), totalTokens);

        emit Claimed(_msgSender(), totalTokens);

        return true;
    }

    function getTokenExpiry() external view returns (uint256) {
        require(addressStaked[_msgSender()] == true, "You are not participated");
        return stakeInfos[_msgSender()].endTS;
    }

    function stakeToken(uint256 stakeAmount) external nonReentrant whenNotPaused {
        require(stakeAmount > 0, "Stake amount should be correct");
        require(stakeAmount < 10000, "Stake amount should be less than 10000");
        require(block.timestamp < planExpired , "Plan Expired");
        require(addressStaked[_msgSender()] == false, "You already participated");
        require(hroToken.balanceOf(_msgSender()) >= stakeAmount, "Insufficient Balance");
        
           hroToken.transferFrom(_msgSender(), address(this), stakeAmount);
            totalStakers++;
            addressStaked[_msgSender()] = true;

            stakeInfos[_msgSender()] = StakeInfo({                
                startTS: block.timestamp,
                endTS: block.timestamp + planDuration,
                amount: stakeAmount,
                claimed: 0
            });
        
        emit Staked(_msgSender(), stakeAmount);
    }    


    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}