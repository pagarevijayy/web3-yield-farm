// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DaiToken public daiToken;
    DappToken public dappToken;

    constructor(DaiToken _daiToken, DappToken _dappToken) public {
        daiToken = _daiToken;
        dappToken = _dappToken;
    }
}
