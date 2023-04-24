const Web3 = require('web3');
const web3 = new Web3();

function getRandomHash(to, amount, tier) {
    const packedData = web3.eth.abi.encodeParameters(['address', 'uint256', 'uint256'], [to, amount, tier]);
    const result = web3.utils.keccak256(packedData);
    return result;
}

const to = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
const amount = 1;
const tier = 1;
console.log(getRandomHash(to, amount, tier));
