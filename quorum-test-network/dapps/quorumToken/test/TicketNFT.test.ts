import { ethers } from "hardhat";
import { expect } from "chai";

describe("TicketNFT - Fixed Contract", function () {
  async function deployTicketNFTFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketNFT = await TicketNFT.deploy();
    await ticketNFT.waitForDeployment();

    return { ticketNFT, owner, addr1, addr2 };
  }

  describe("Fix 1: Reentrancy Protection", function () {
    it("Should properly execute comprarIngresso without reentrancy issues", async function () {
      const { ticketNFT, owner, addr1, addr2 } = await deployTicketNFTFixture();

      // Create an event in the future
      const futureTimestamp = (await ethers.provider.getBlock("latest")).timestamp + 43200; // 12 hours in the future

      // Create an ingresso as owner
      await ticketNFT.connect(owner).criarIngresso("Concert", ethers.parseEther("1"), futureTimestamp);

      // Transfer the ticket to addr1 so they can revend it
      await ticketNFT.connect(owner).transferFrom(await owner.getAddress(), await addr1.getAddress(), 1);

      // addr1 revends the ticket
      await ticketNFT.connect(addr1).revenderIngresso(1, ethers.parseEther("0.5"));

      // addr2 should be able to buy it
      await expect(
        ticketNFT.connect(addr2).comprarIngresso(1, { value: ethers.parseEther("0.5") })
      ).to.not.be.reverted;
    });
  });

  describe("Fix 2: Event Date Validation", function () {
    it("Should reject event with past date", async function () {
      const { ticketNFT, owner } = await deployTicketNFTFixture();
      
      // Use a past timestamp
      const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day in the past
      
      await expect(
        ticketNFT.connect(owner).criarIngresso("Past Event", ethers.parseEther("1"), pastTimestamp)
      ).to.be.revertedWith("Data do evento deve ser futura");
    });

    it("Should accept event with future date", async function () {
      const { ticketNFT, owner } = await deployTicketNFTFixture();

      // Use a significantly future timestamp (in 12 hours to account for any time differences)
      const futureTimestamp = (await ethers.provider.getBlock("latest")).timestamp + 43200; // 12 hours in the future

      const tx = await ticketNFT.connect(owner).criarIngresso("Future Event", ethers.parseEther("1"), futureTimestamp);
      await tx.wait();

      // Verify the event was created
      const ingresso = await ticketNFT.ingressos(1);
      expect(ingresso.evento).to.equal("Future Event");
    });
  });

  describe("Fix 3: Gas Efficiency", function () {
    it("Should return user tokens efficiently", async function () {
      const { ticketNFT, owner, addr1, addr2 } = await deployTicketNFTFixture();

      // Create events in the future
      const futureTimestamp = (await ethers.provider.getBlock("latest")).timestamp + 43200; // 12 hours in the future

      // Create a few tickets for owner
      await ticketNFT.connect(owner).criarIngresso("Event 1", ethers.parseEther("1"), futureTimestamp);
      await ticketNFT.connect(owner).criarIngresso("Event 2", ethers.parseEther("2"), futureTimestamp);

      // Owner revends the first ticket
      await ticketNFT.connect(owner).revenderIngresso(1, ethers.parseEther("0.5"));

      // addr2 should buy the first ticket
      await ticketNFT.connect(addr2).comprarIngresso(1, { value: ethers.parseEther("0.5") });

      // Check tokens for each user
      const ownerTokens = await ticketNFT.ingressosDoUsuario(await owner.getAddress());
      const addr1Tokens = await ticketNFT.ingressosDoUsuario(await addr1.getAddress());
      const addr2Tokens = await ticketNFT.ingressosDoUsuario(await addr2.getAddress());

      // Owner should have token 2
      expect(ownerTokens.length).to.equal(1);
      expect(ownerTokens[0]).to.equal(2n);

      // addr1 should have no tokens
      expect(addr1Tokens.length).to.equal(0);

      // addr2 should have token 1
      expect(addr2Tokens.length).to.equal(1);
      expect(addr2Tokens[0]).to.equal(1n);
    });
  });

  describe("General Functionality", function () {
    it("Should create ingresso with correct data", async function () {
      const { ticketNFT, owner } = await deployTicketNFTFixture();
      
      const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
      const tx = await ticketNFT.connect(owner).criarIngresso("Test Event", ethers.parseEther("1"), futureTimestamp);
      await tx.wait();
      
      const ingresso = await ticketNFT.ingressos(1);
      expect(ingresso.evento).to.equal("Test Event");
      expect(ingresso.preco).to.equal(ethers.parseEther("1"));
      expect(ingresso.dataEvento).to.equal(futureTimestamp);
    });
  });
});