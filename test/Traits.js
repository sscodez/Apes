const { expect } = require("chai");
const { BN, toBN, fromWei } = web3.utils;
const { soliditySha3 } = web3.eth.abi;


const ApesTraits = artifacts.require("ApesTraits");

contract("ApesTraits", (accounts) => {
  let apesTraits;
  let owner;
  let minter;

  beforeEach(async () => {
    // Deploy a new instance of the contract before each test
    apesTraits = await ApesTraits.new("ApesTraits", "APES", "");
    owner = accounts[0];
    minter = accounts[1];
  });

  describe("mint", () => {
    it("should mint the token", async () => {
      // Allow the minter to mint tokens
      await apesTraits.setIsMinter(minter, true);

      // Mint a token
      const tokenId = soliditySha3("token1");
      const amount = toBN(1);
      const to = accounts[2];
      await apesTraits.mint(to, tokenId, amount, { from: minter });

      // Check the balance of the recipient
      const balance = await apesTraits.balanceOf(to, tokenId);
      expect(balance).to.be.bignumber.equal(amount);

    });

    it("should not mint the token if the minter is not authorized", async () => {
      // Do not allow the minter to mint tokens
      await apesTraits.setIsMinter(minter, false);

      // Try to mint a token
      const tokenId = soliditySha3("token1");
      const amount = toBN(1);
      const to = accounts[2];
      try {
        await apesTraits.mint(to, tokenId, amount, { from: minter });
        expect.fail("The transaction should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Mint: Not authorized to mint");
      }
    });

})

})