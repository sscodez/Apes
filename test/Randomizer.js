const ApesRandomizer = artifacts.require("ApesRandomizer");
const chai = require("chai");
const { expect } = chai;

contract("ApesRandomizer", (accounts) => {
    let apesRandomizer;

    beforeEach(async () => {
        apesRandomizer = await ApesRandomizer.new();
    });

    describe("Function: encode", () => {
        it("should return the correct encoded data", async () => {
            // Set an operator
            await apesRandomizer.setOperator(accounts[0], true, {
                from: accounts[0],
            });

            // Call the function
            const encodedData = await apesRandomizer.encode([1, 2, 3], {
                from: accounts[0],
            });

            // Check if the returned data is correct
            expect(encodedData).to.equal("0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003");
        });

        it("should throw an error if the caller is not an operator", async () => {
            // Try to call the function without being an operator
            try {
                await apesRandomizer.encode([1, 2, 3], {
                    from: accounts[1],
                });
                assert.fail("This function should have thrown an error");
            } catch (error) {
                expect(error.message).to.include("Not authorised");
            }
        });
    });

    describe("Function: getRandom", () => {
        it("should return the correct random numbers", async () => {
            // Set an operator
            await apesRandomizer.setOperator(accounts[0], true, {
                from: accounts[0],
            });

            // Call the function
            const randomNumbers = await apesRandomizer.getRandom(
                "0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003",
                2,
                { from: accounts[0] }
            );

            // Check if the returned data is correct
            expect(randomNumbers[0]).to.be.a("number");
            expect(randomNumbers[1]).to.be.a("number");
        });

        it("should throw an error if the caller is not an operator", async () => {
            // Try to call the function without being an operator
            try {
                await apesRandomizer.getRandom(
                    "0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003",
                    2,
                    { from: accounts[1] }
                );
                assert.fail("This function should have thrown an error");
            } catch (error) {
                expect(error.message).to.include("Not authorised");
            }
        });
    });

    describe("Function: Set Operator", () => {

        it("Should allow the owner to set an operator", async () => {
            await apesRandomizer.setOperator(accounts[1], true, { from: accounts[0] });
            const result = await apesRandomizer.isOperator(accounts[1]);
            expect(result).to.equal(true);
        });

        it("Should not allow a non-owner to set an operator", async () => {
            try {
                await apesRandomizer.setOperator(accounts[1], true, { from: accounts[1] });
            } catch (error) {
                expect(error.message).to.equal("VM Exception while processing transaction: revert Not owner");
            }
        });

    });

    describe("Function: Random", () => {

        it("random function should return a uint256 value", async function () {
            const seed = 100;
            const randomNumber = await apesRandomizer.random(seed);

            expect(randomNumber).to.be.a("uint256");
        });


    });

});



