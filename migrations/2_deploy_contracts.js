// Import the contracts to be deployed
const TokenFarm = artifacts.require('TokenFarm');
const DappToken = artifacts.require('DappToken');
const DaiToken = artifacts.require('DaiToken');

// Async function would help with await as
// there is a certain process flow that needs to take place.
// The additional args are required to know the network that the
// smart contracts are deployed to and the accounts that exist on that network.
module.exports = async function (deployer, network, accounts) {
  // Deploy the DAI Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  // Deploy the Dapp Token
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  // Deploy the TokenFarm
  // In order for the constructor to access the args
  // we need to send it while deploying the contract as extra args.
  // They need to match the way it's setup in the constructor function.
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  // Tranfer all the dapp tokens to TokenFarm
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

  // Tranfer 100 Mock DAI tokens to the investor
  // This is to let that investor invest DAI to get DAPP tokens
  await daiToken.transfer(accounts[1], '100000000000000000000');
};
