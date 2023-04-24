assert = require('chai').assert;
const { expect } = require('chai');
const { soliditySha3 } = require('web3-utils');
const { BN } = require('ethereumjs-util');
const { soliditySha3 } = require("web3-utils");

const LootBoxes = artifacts.require("LootBoxes");
const IApes = artifacts.require("IApes");
const ITraits = artifacts.require("ITraits");
const IRandomizer = artifacts.require("IRandomizer");
const IERC20 = artifacts.require("IERC20");

contract('LootBoxes', (accounts) => {
 

    describe("Open Box", () => {

    let instance;

    beforeEach(async () => {
        instance = await LootBoxes.new(
            accounts[1],
            accounts[2],
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
        );
        
    });

    it('Create Box', async () => {
        // Set the creator address as an allowed creator of boxes
        await instance.methods['isBoxCreator(address)'].call(accounts[0], true);

        // Create a new box
        await instance.createBox(0, 100, 0, 200);

        // Check the number of boxes
        const boxesAmount = await instance.methods['boxesAmount'].call();
        expect(boxesAmount).to.be.bignumber.equal(new BN(1));

        // Check the info of the newly created box
        const boxInfo = await instance.methods['boxInfo(uint256)'].call(0);
        expect(boxInfo.boxType).to.be.bignumber.equal(new BN(0));
        expect(boxInfo.currentPrice).to.be.bignumber.equal(new BN(100));
        expect(boxInfo.minPrice).to.be.bignumber.equal(new BN(0));
        expect(boxInfo.maxPrice).to.be.bignumber.equal(new BN(200));

        // Check the last box open time
        const lastBoxOpen = await instance.methods['lastBoxOpen(uint256)'].call(0);
        expect(lastBoxOpen).to.be.bignumber.above(0);

        // Check the last box increase time
        const lastBoxIncrease = await instance.methods['lastBoxIncrease(uint256)'].call(0);
        expect(lastBoxIncrease).to.be.bignumber.above(0);

        // Check the event log
        const events = await instance.getPastEvents('BoxCreated', { fromBlock: 0, toBlock: 'latest' });
        expect(events[0].returnValues.boxType).to.be.bignumber.equal(new BN(0));
        expect(events[0].returnValues.initialPrice).to.be.bignumber.equal(new BN(100));
        expect(events[0].returnValues.minPrice).to.be.bignumber.equal(new BN(0));
        expect(events[0].returnValues.maxPrice).to.be.bignumber.equal(new BN(200));
        expect(events[0].returnValues.operator).to.equal(accounts[0]);
    });

    })
    describe("Open Box", () => {

        beforeEach(async () => {
            apes = await IApes.new();
            traits = await ITraits.new();
            randomizer = await IRandomizer.new();
            meth = await IERC20.new();
            apesAddress = apes.address;
            traitsAddress = traits.address;
            randomizerAddress = randomizer.address;
            methAddress = meth.address;
            secret = accounts[9];
            treasury = accounts[8];
    
            lootBoxes = await LootBoxes.new(
                apesAddress,
                traitsAddress,
                randomizerAddress,
                methAddress,
                secret,
                treasury
            );
        });

        let boxId = 0;
        let apeId = 1;
        let amount = 10;
        let timeOut = 1000000000;
        let hasPower = true;
        let randomSeed = "0x123456789";
        let signature = soliditySha3(randomSeed, timeOut);

        it("should open box successfully", async () => {
            await lootBoxes.createBox(0, 100, 50, 200, { from: owner });
            const result = await lootBoxes.openBox(
                boxId,
                apeId,
                amount,
                timeOut,
                hasPower,
                randomSeed,
                signature,
                { from: owner, value: 100 }
            );

            // Check event log
            expect(result.logs[0].event).to.be.equal("BoxOpened");
            expect(result.logs[0].args.boxId).to.be.bignumber.equal(boxId);
            expect(result.logs[0].args.apeId).to.be.bignumber.equal(apeId);
            expect(result.logs[0].args.amount).to.be.bignumber.equal(amount);
        });


        // Test case to check that box cannot be opened if the sender is not the owner of the ape token
        it('should fail to open box if sender is not the owner', async () => {
            try {
                // Add an owner of an Ape token
                let owner = accounts[0];
                let notOwner = accounts[1];
                await apesContract.confirmChange(1, { from: owner });

                // Try to open the box from a non-owner address
                await lootBoxesInstance.openBox(
                    1,
                    1,
                    10,
                    1000000,
                    false,
                    '0x1234',
                    '0x5678',
                    { from: notOwner, value: 10 }
                );

                // If the openBox function does not throw an error, the test case will fail
                assert.fail('Expected throw not received');
            } catch (error) {
                // Check if the error is the expected error (transaction should revert)
                assert.include(error.message, 'revert', 'Unexpected error thrown');
            }
        });

    })



});