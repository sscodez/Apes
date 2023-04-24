const { expect } = require("chai");
const { toBN, toHex, hexToBytes } = web3.utils;

const TraitsConstructor = artifacts.require("TraitsConstructor");
const ApeContract = artifacts.require("ApeContract");
const TraitsContract = artifacts.require("TraitsContract");

contract("TraitsConstructor", ([sender, owner]) => {
  let traitsConstructor;
  let apeContract;
  let traitsContract;
  let secret;

  before(async () => {
    apeContract = await ApeContract.new();
    traitsContract = await TraitsContract.new();
    secret = toHex("secret");
    traitsConstructor = await TraitsConstructor.new(apeContract.address, traitsContract.address, secret);
  });

  it("equips a token with traits", async () => {
    const tokenId = toBN(1);
    const traitsIn = [toBN(1), toBN(2)];
    const traitsOut = [toBN(3), toBN(4)];
    const traitsOGOut = [toBN(5), toBN(6)];
    const changeCode = "change code";

    const encodedData = abi.encode(
      tokenId,
      traitsIn.map(toHex),
      traitsOut.map(toHex),
      traitsOGOut.map(toHex),
      changeCode,
      sender
    );

    const signature = await web3.eth.sign(encodedData, owner);

    const tx = await traitsConstructor.equip(tokenId, traitsIn, traitsOut, traitsOGOut, changeCode, signature);

    expect(tx.logs[0].event).to.eq("Equipped");
    expect(tx.logs[0].args.tokenId).to.be.bignumber.eq(tokenId.addn(10000));
    expect(tx.logs[0].args.changeCode).to.eq(changeCode);
    expect(tx.logs[0].args.operator).to.eq(sender);
  });
});
