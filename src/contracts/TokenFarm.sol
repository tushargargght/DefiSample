pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address[] public stakers;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stake tokens
    function stakeTokens(uint _amount) public {

        require(_amount > 0, 'amount must be greater than zero');

        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // 2. Issuing tokens
    function issueTokens() public {
        require (msg.sender == owner, "caller must be owner");

        for (uint i=0; i<stakers.length; i++) {
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            
            if (balance > 0)
                dappToken.transfer(recepient, balance);
        }
    }

    // 3. Unstake tokens
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, 'amount must be greater than zero');

        daiToken.transferFrom(address(this), msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

}