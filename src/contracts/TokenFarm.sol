// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DaiToken public daiToken;
    DappToken public dappToken;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DaiToken _daiToken, DappToken _dappToken) public {
        daiToken = _daiToken;
        dappToken = _dappToken;
        owner = msg.sender;
    }

    // 1. Stake tokens (deposit)
    function stakeTokens(uint256 _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        // Trasnfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // 2. Unstake tokens (withdraw)
    function unstakeTokens() public {
        // ideal: User must be allowed to unstake the amount she wants to. Instead of unstaking everything.

        // fetch staked amount
        uint256 stakedAmount = stakingBalance[msg.sender];

        // amount must be greater than 0
        require(
            stakedAmount > 0,
            "already staked amount must be greater than 0"
        );

        // transfer staked amount
        daiToken.transfer(msg.sender, stakedAmount);

        // reset staking balance
        stakingBalance[msg.sender] = 0;

        // update staking status
        isStaking[msg.sender] = false;
    }

    // 3. Issue tokens (interest)
    function issueTokens() public {
        // only owner can issue tokens
        require(msg.sender == owner, "caller must be owner");

        //Issue tokens to all stakers
        for (uint256 index = 0; index < stakers.length; index++) {
            address recipient = stakers[index];
            uint256 balance = stakingBalance[recipient];
            if(balance > 0){
                // ideal: should make sure the farm has sufficient tokens before dispatching
                dappToken.transfer(recipient, balance);
            }
        }

    }
}

// Remark: Logic should be updated to better map the real world staking scenarios. Current implementation is limited.