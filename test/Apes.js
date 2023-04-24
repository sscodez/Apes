const BAP_APES = artifacts.require("BAP_APES");
const chai = require("chai");
chai.use(require("chai-as-promised"))

const expect = chai.expect;

contract("BAP_APES", accounts => {
  let bap_apes;
  const owner = accounts[0];
  const recipient = accounts[1];
  const orchestrator = accounts[2];
  const user = accounts[3];


  beforeEach(async () => {
    bap_apes = await BAP_APES.new(owner, owner);

  });


  describe("AirDrop", () => {

    it("should airdrop the specified amount to the specified address", async () => {
      const initialTreasurySupply = await bap_apes.trasurySuply();
      const amount = 100;

      try {
        await bap_apes.airdrop(recipient, amount, { from: owner });
      } catch (error) {
        expect(error.message).to.include('Only the contract owner can perform this action');
      }

      const finalTreasurySupply = await bap_apes.trasurySuply();
      const recipientBalance = await bap_apes.balanceOf(recipient);


      assert.equal(finalTreasurySupply, (initialTreasurySupply - amount));
      assert.equal(recipientBalance, (amount));


    });

    it('should prevent airdrop from non-owner', async () => {
      const initialTreasurySupply = await bap_apes.trasurySuply();
      const amount = 100;

      try {
        await bap_apes.airdrop(recipient, amount, { from: owner });
      } catch (error) {
        expect(error.message).to.include('Only the contract owner can perform this action');
      }

      const finalTreasurySupply = await bap_apes.trasurySuply();
      const recipientBalance = await bap_apes.balanceOf(recipient);

      assert.equal(finalTreasurySupply, (initialTreasurySupply - amount));
      assert.equal(recipientBalance, (amount));

    });


    it('should prevent airdrop of more tokens than available in the treasury', async () => {
      const amount = 20000;

      try {
        await bap_apes.airdrop(recipient, amount, { from: owner });
      } catch (error) {
        expect(error.message).to.include('Airdrop: Supply is over');
      }

      const recipientBalance = await bap_apes.balanceOf(recipient);

      assert.equal(recipientBalance, 0);
    });

  });


  describe("Purchase", () => {


    beforeEach(async () => {
      await bap_apes.setOrchestrator(orchestrator, true, { from: owner });
    });


    it("Should purchase token successfully", async () => {

      await bap_apes.purchase(user, 2, 1, "0x00", {
        from: orchestrator,
        value: 54000000000000000
      });
      const publicSupply = await bap_apes.publicSupply();
      console.log('Public Supply', publicSupply);
      assert.equal(publicSupply, 3498);

    });

    it("Should fail if tier is not available", async () => {
      await expect(
        bap_apes.purchase(user, 2, 6, "0x00", {
          from: orchestrator,
          value: 54000000000000000
        })
      ).to.be.rejectedWith("Purchase: Sale closed");
    });

    it("Should fail if publicSupply is over", async () => {
      await expect(
        bap_apes.purchase(user, 10000, 1, "0x00", {
          from: orchestrator,
          value: 2200000000000000000
        })
      ).to.be.rejectedWith("Purchase: Supply is over");
    });

    it("Should fail if exceeds mint limit", async () => {
      await bap_apes.purchase(user, 2, 1, "0x00", {
        from: orchestrator,
        value: 54000000000000000
      });
      await expect(
        bap_apes.purchase(user, 1, 1, "0x00", {
          from: orchestrator,
          value: 27000000000000000
        })
      ).to.be.rejectedWith("Purchase: Exceed mint limit");
    });

    it("Should fail if incorrect ETH amount", async () => {
      await expect(
        bap_apes.purchase(user, 2, 1, "0x00", {
          from: orchestrator,
          value: 53000000000000000
        })
      ).to.be.rejectedWith("Purchase: Incorrect ETH amount");
    });

    it("Should fail if signature is invalid", async () => {
      await expect(
        bap_apes.purchase(user, 2, 1, "0x01", {
          from: orchestrator,
          value: 54000000000000000
        })
      ).to.be.rejectedWith("Purchase: Signature is invalid");
    })



  })

  describe("ExchangePass", () => {


    beforeEach(async () => {

      const portalPassAddress = accounts[2];
      portalPass = await IERC1155.new();

    });

    it("should exchange portal pass for tokens", async () => {
      const initialReservedSupply = await bapApes.reservedSuply();
      const initialPublicSupply = await bapApes.publicSupply();
      const initialTreasurySupply = await bapApes.trasurySuply();

      const amount = 10;
      const tokenId = 1;

      await portalPass.safeTransferFrom(user, portalPassAddress, tokenId, amount, "0x00", { from: user });

      await bapApes.exchangePass(user, amount, { from: user });

      const newReservedSupply = await bapApes.reservedSuply();
      const newPublicSupply = await bapApes.publicSupply();
      const newTreasurySupply = await bapApes.trasurySuply();

      assert.equal(newReservedSupply, initialReservedSupply - amount, "Reserved supply not reduced");
      assert.equal(newPublicSupply, initialPublicSupply + amount, "Public supply not increased");
      assert.equal(newTreasurySupply, initialTreasurySupply, "Treasury supply not changed");

    });


    it("should fail if the supply is over", async () => {
      const initialReservedSupply = await bapApes.reservedSuply();
      const initialPublicSupply = await bapApes.publicSupply();
      const initialTreasurySupply = await bapApes.trasurySuply();

      const amount = 5000;
      const tokenId = 1;



      try {
        await portalPass.safeTransferFrom(user, portalPassAddress, tokenId, amount, "0x00", { from: user });
        await bapApes.exchangePass(user, amount, { from: user });
      } catch (error) {

        expect(error.message).to.equal("Pass Exchange: Supply is over");
      }

      const finalReservedSupply = await bapApes.reservedSuply();
      const finalPublicSupply = await bapApes.publicSupply();
      const finalTreasurySupply = await bapApes.trasurySuply();

      assert.equal(finalReservedSupply, initialReservedSupply - amount, "Reserved supply not reduced");
      assert.equal(finalPublicSupply, initialPublicSupply + amount, "Public supply not increased");
      assert.equal(finalTreasurySupply, initialTreasurySupply, "Treasury supply not changed");

    });

  })


  describe("ExchangePass", () => {

    it("it should refund a token", async () => {
      const tokenId = 1;

      // Mint a token
      await bapApes.mint(owner, tokenId, 0);

      // Check that the token has been minted
      const tokenOwner = await bapApes.ownerOf(tokenId);
      expect(tokenOwner).to.equal(owner);

      // Refund the token
      await bapApes.refund(tokenId);

      // Check that the token has been burned
      const tokenExists = await bapApes.exists(tokenId);
      expect(tokenExists).to.be.false;

      // Check that the token balance of the owner has been reduced by 1
      const tokenBalance = await bapApes.balanceOf(owner);
      expect(tokenBalance).to.be.bignumber.equal(0);

      // Check that the "Refunded" event has been emitted
      const events = await bapApes.getPastEvents("Refunded");
      expect(events.length).to.equal(1);
      expect(events[0].args.user).to.equal(owner);
      expect(events[0].args.tokenId).to.be.bignumber.equal(tokenId);
    });


  })

})
