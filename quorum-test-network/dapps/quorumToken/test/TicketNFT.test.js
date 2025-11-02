const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketNFT", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployTicketNFTFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketNFT = await TicketNFT.deploy();
    await ticketNFT.waitForDeployment();
    
    const address = await ticketNFT.getAddress();
    return { ticketNFT, address, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { ticketNFT, owner } = await loadFixture(deployTicketNFTFixture);
      expect(await ticketNFT.owner()).to.equal(owner.address);
    });

    it("Should initialize nextTokenId to 1", async function () {
      const { ticketNFT } = await loadFixture(deployTicketNFTFixture);
      expect(await ticketNFT.nextTokenId()).to.equal(1);
    });
  });

  describe("Creating Tickets", function () {
    it("Should allow owner to create a ticket", async function () {
      const { ticketNFT, owner } = await loadFixture(deployTicketNFTFixture);
      
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5"); // 0.5 ETH
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await expect(ticketNFT.criarIngresso(eventName, price, eventDate))
        .to.emit(ticketNFT, "IngressoCriado")
        .withArgs(1, eventName, price, eventDate);
      
      const ticket = await ticketNFT.ingressos(1);
      expect(ticket.evento).to.equal(eventName);
      expect(ticket.preco).to.equal(price);
      expect(ticket.dataEvento).to.equal(eventDate);
      expect(ticket.status).to.equal(0); // Status.Disponivel = 0
      
      // Check token ownership
      expect(await ticketNFT.ownerOf(1)).to.equal(owner.address);
    });

    it("Should not allow non-owner to create a ticket", async function () {
      const { ticketNFT, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await expect(
        ticketNFT.connect(otherAccount).criarIngresso(eventName, price, eventDate)
      ).to.be.revertedWithCustomError(ticketNFT, "OwnableUnauthorizedAccount");
    });

    it("Should reject creating a ticket with past event date", async function () {
      const { ticketNFT } = await loadFixture(deployTicketNFTFixture);
      
      const eventName = "Past Event";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      
      await expect(
        ticketNFT.criarIngresso(eventName, price, eventDate)
      ).to.be.revertedWith("Data do evento deve ser futura");
    });
  });

  describe("Buying Tickets", function () {
    it("Should allow someone to buy a ticket", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket first
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      // Buy the ticket
      await expect(
        ticketNFT.connect(otherAccount).comprarIngresso(1, { value: price })
      )
        .to.emit(ticketNFT, "IngressoVendido")
        .withArgs(1, otherAccount.address, price);
      
      // Check new ownership
      expect(await ticketNFT.ownerOf(1)).to.equal(otherAccount.address);
      
      // Check status is now sold
      expect(await ticketNFT.statusIngresso(1)).to.equal(1); // Status.Vendido = 1
    });

    it("Should reject buying a non-existent ticket", async function () {
      const { ticketNFT, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      const price = ethers.parseEther("0.5");
      
      await expect(
        ticketNFT.connect(otherAccount).comprarIngresso(999, { value: price })
      ).to.be.revertedWithCustomError(ticketNFT, "ERC721NonexistentToken");
    });

    it("Should reject buying a ticket that is not for sale", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket and immediately resell it (changing status to Revenda)
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      // Owner sells it to otherAccount
      await ticketNFT.connect(otherAccount).comprarIngresso(1, { value: price });
      
      // Now owner can't buy it back (not for sale)
      await expect(
        ticketNFT.connect(owner).comprarIngresso(1, { value: price })
      ).to.be.revertedWith("Ingresso nao esta a venda");
    });

    it("Should reject buying a ticket with insufficient funds", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      const insufficientAmount = ethers.parseEther("0.3");
      
      await expect(
        ticketNFT.connect(otherAccount).comprarIngresso(1, { value: insufficientAmount })
      ).to.be.revertedWith("Valor insuficiente");
    });
  });

  describe("Reselling Tickets", function () {
    it("Should allow ticket owner to resell a ticket", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket
      const eventName = "Test Concert";
      const initialPrice = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, initialPrice, eventDate);
      
      // Buy the ticket
      await ticketNFT.connect(otherAccount).comprarIngresso(1, { value: initialPrice });
      
      // Now resell it
      const newPrice = ethers.parseEther("0.6");
      
      await expect(ticketNFT.connect(otherAccount).revenderIngresso(1, newPrice))
        .to.emit(ticketNFT, "IngressoRevenda")
        .withArgs(1, newPrice);
      
      // Check status is now revenda
      expect(await ticketNFT.statusIngresso(1)).to.equal(2); // Status.Revenda = 2
    });

    it("Should not allow non-owner to resell a ticket", async function () {
      const { ticketNFT, owner, otherAccount, thirdAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create and buy a ticket
      const eventName = "Test Concert";
      const initialPrice = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, initialPrice, eventDate);
      await ticketNFT.connect(otherAccount).comprarIngresso(1, { value: initialPrice });
      
      const newPrice = ethers.parseEther("0.6");
      
      await expect(
        ticketNFT.connect(thirdAccount).revenderIngresso(1, newPrice)
      ).to.be.revertedWith("Nao eh dono");
    });
  });

  describe("View Functions", function () {
    it("Should correctly verify ticket existence", async function () {
      const { ticketNFT, owner } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      // Check that the ticket exists
      expect(await ticketNFT.verificarIngresso(1)).to.equal(true);
      
      // Check that a non-existent ticket returns false
      expect(await ticketNFT.verificarIngresso(999)).to.equal(false);
    });

    it("Should return correct status for a ticket", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create a ticket
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      // Initially should be available (0)
      expect(await ticketNFT.statusIngresso(1)).to.equal(0); // Status.Disponivel
      
      // Buy the ticket
      await ticketNFT.connect(otherAccount).comprarIngresso(1, { value: price });
      
      // Now it should be sold (1)
      expect(await ticketNFT.statusIngresso(1)).to.equal(1); // Status.Vendido
    });

    it("Should return correct event date for a ticket", async function () {
      const { ticketNFT } = await loadFixture(deployTicketNFTFixture);
      
      const eventName = "Test Concert";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName, price, eventDate);
      
      expect(await ticketNFT.dataEvento(1)).to.equal(eventDate);
    });

    it("Should return tickets owned by a user", async function () {
      const { ticketNFT, owner, otherAccount } = await loadFixture(deployTicketNFTFixture);
      
      // Create two tickets
      const eventName1 = "Test Concert 1";
      const eventName2 = "Test Concert 2";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName1, price, eventDate);
      await ticketNFT.criarIngresso(eventName2, price, eventDate);
      
      // Buy one ticket
      await ticketNFT.connect(otherAccount).comprarIngresso(1, { value: price });
      
      // Check tickets for otherAccount (should own ticket 1)
      const otherAccountTickets = await ticketNFT.ingressosDoUsuario(otherAccount.address);
      expect(otherAccountTickets).to.deep.equal([1]);
      
      // Check tickets for owner (should own ticket 2)
      const ownerTickets = await ticketNFT.ingressosDoUsuario(owner.address);
      expect(ownerTickets).to.deep.equal([2]);
    });

    it("Should list all tickets", async function () {
      const { ticketNFT } = await loadFixture(deployTicketNFTFixture);
      
      // Create three tickets
      const eventName1 = "Test Concert 1";
      const eventName2 = "Test Concert 2";
      const eventName3 = "Test Concert 3";
      const price = ethers.parseEther("0.5");
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await ticketNFT.criarIngresso(eventName1, price, eventDate);
      await ticketNFT.criarIngresso(eventName2, price, eventDate);
      await ticketNFT.criarIngresso(eventName3, price, eventDate);
      
      // List all tickets
      const allTickets = await ticketNFT.listarIngressos();
      expect(allTickets).to.deep.equal([1, 2, 3]);
    });
  });
});