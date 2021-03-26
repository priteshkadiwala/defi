const TokenFarm = artifacts.require('TokenFarm');

// Async function would help with await as
// there is a certain process flow that needs to take place.
// The additional args are required to know the network that the
// smart contracts are deployed to and the accounts that exist on that network.
module.exports = async function (callback) {
  // Wait for the contract to be deployed.
  let tokenFarm = await TokenFarm.deployed();
  // Call the issueToken function
  await tokenFarm.issueTokens();
  // Log to the console
  console.log('Tokens were issues.');
  // Send the callback
  callback();
};
