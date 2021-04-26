/* eslint-disable no-undef */
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");


module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();
  const daiTokenAddress = daiToken.address;

  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();
  const dappTokenAddress = dappToken.address;

  await deployer.deploy(TokenFarm, daiTokenAddress, dappTokenAddress);
  const tokenFarm = await TokenFarm.deployed();

  // transfer all the dapp token to the tokenFarm (from the deployer account)
  const initialSupply = '1000000000000000000000000'; 
  await dappToken.transfer(tokenFarm.address, initialSupply)

  // transfer 100 mock Dai to the investor so he can invest it - in return for dapp token (from deployer)
  const mockDAI = '100000000000000000000'; 
  await daiToken.transfer(accounts[1], mockDAI)

};
