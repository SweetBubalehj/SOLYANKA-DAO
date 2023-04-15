const { expect } = require("chai");
const { ethers } = require("hardhat")

let accounts, SBTArgs, SBToken, SBTContract;

describe("SBT token", function() {

  beforeEach(async function() {
    accounts = await ethers.getSigners();
    SBTArgs = ["Solyanka SBT", "Bubaleh", "...@gmail.com", 21];
    SBToken = await ethers.getContractFactory("SBToken");
    SBTContract = await SBToken.deploy(
      SBTArgs[0],
      SBTArgs[1],
      SBTArgs[2],
      SBTArgs[3]
    );
  });

  it("Check KYC", async function() {
    expect(await SBTContract.checkKYC(accounts[0].address)).to.be.equal(true);
  });

  it("Check Identity", async function() {
    expect(await SBTContract.checkIdentity(accounts[0].address)).to.be.equal(true);
  });

  it("Check Admin Role", async function() {
    expect(await SBTContract.getRole(accounts[0].address)).to.be.equal(2);
  });

  it("Check does not exist soul", async function() {
    let soul = await SBTContract.getSoul(accounts[1].address);
    expect(soul.owner).to.be.equal("0x0000000000000000000000000000000000000000");
  });
  
  it("Check create soul", async function() {
    let soulArg = ["example", "example@mail.com", 20];
    createSoul = await SBTContract.connect(accounts[1]).createSoul(
      soulArg[0],
      soulArg[1],
      soulArg[2]
    );
    let soul = await SBTContract.getSoul(accounts[1].address);
    expect(soul.owner).to.be.equal(accounts[1].address);
  });

  it("Check Update Data", async function() {
    updateDataArg = ["UpdateName", "UpdateEmail", 30];
    updateData = await SBTContract.updateDataSoul(
      updateDataArg[0],
      updateDataArg[1],
      updateDataArg[2]
    );
    let soul = await SBTContract.getSoul(accounts[0].address);
    expect(soul.name).to.be.equal("UpdateName");
    expect(soul.email).to.be.equal("UpdateEmail");
    expect(soul.age).to.be.equal(30);
  });

  it("Check Admin rights", async function() {
    //addModer = await SBTContract.connect(accounts[1]).addModerator(accounts[1].address);
    await expect(SBTContract.connect(accounts[1]).addModerator(accounts[1].address)).to.be.revertedWith('Not an Admin');
  })
});

let VotingFactoryContract;

describe("Voting Factory", async function() {
  
  beforeEach(async () => {
    const VotingFactoryArgs = SBTContract.address;
    const VotingFactory = await ethers.getContractFactory("VotingFactory");
    VotingFactoryContract = await VotingFactory.deploy(VotingFactoryArgs);
  });

  it("Check SBT address", async () => {
    expect(await VotingFactoryContract.getSBTAddress()).to.equals(SBTContract.address);
  });


  it("Check Deployed Votings", async () => {
    argVoting = ["examp", ["ex1", "ex2"], 60, true, false];
    await VotingFactoryContract.createVoting(
      argVoting[0],
      argVoting[1],
      argVoting[2],
      argVoting[3],
      argVoting[4],
    );
    expect(await VotingFactoryContract.getDeployedVotings()).to.be.lengthOf(1);
  });

  it("Check Deployed Token", async () => {
    argVoting = ["examp", ["ex1", "ex2"], 60, "0x0000000000000000000000000000000000000001"];
    await VotingFactoryContract.createTokenWeightedVoting(
      argVoting[0],
      argVoting[1],
      argVoting[2],
      argVoting[3],
    );
    expect(await VotingFactoryContract.getDeployedTokenWeightedVotings()).to.be.lengthOf(1);
  });
});