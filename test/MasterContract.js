const chai = require('chai');
const assert = chai.assert;

const MasterContract = artifacts.require("MasterContract");
const BAPMethane = artifacts.require("BAPMethane");
const BAPUtilities = artifacts.require("BAPUtilities");
const BAPTeenBulls = artifacts.require("BAPTeenBulls");

contract("MasterContract", (accounts) => {
  let masterContract;
  let bapMethane;
  let bapUtilities;
  let bapTeenBulls;
  let owner = accounts[0];
  let authorizedUser = accounts[1];
  let unauthorizedUser = accounts[2];

  beforeEach(async () => {
    bapMethane = await BAPMethane.new();
    bapUtilities = await BAPUtilities.new();
    bapTeenBulls = await BAPTeenBulls.new();
    masterContract = await MasterContract.new(bapMethane.address, bapUtilities.address, bapTeenBulls.address);
  });

  it("should not allow unauthorized user to call methods", async () => {
    try {
      await masterContract.claim(authorizedUser, 100, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }

    try {
      await masterContract.pay(100, 10, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }

    try {
      await masterContract.airdrop(authorizedUser, 100, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }

    try {
      await masterContract.burnTeenBull(100, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }

    try {
      await masterContract.burn(100, 100, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }

    try {
      await masterContract.airdrop(authorizedUser, 100, 100, { from: unauthorizedUser });
      assert.fail();
    } catch (error) {
      assert.include(error.message, "Not Authorized");
    }
  });

  it("should allow authorized user to call methods", async () => {
    await masterContract.setAuthorized(authorizedUser, true, { from: owner });
    await masterContract.claim(authorizedUser, 100, { from: authorizedUser });
    await masterContract.pay(100, 10, { from: authorizedUser });
    await masterContract.airdrop(authorizedUser, 100, { from: authorizedUser });
    await masterContract.burnTeenBull(100, { from: authorizedUser });
    await masterContract.burn(100, 100, { from: authorizedUser });
    await masterContract.airdrop(authorizedUser, 100, 100, { from: authorizedUser });
  });

})