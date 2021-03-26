// Tokens function is used to convert an ether amount toWei.
// Defining this function would help cut out the repetition
// of the function throughout the tests.
function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

module.exports = {
  tokens,
};
