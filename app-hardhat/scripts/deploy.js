// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function verify(contractAddress, arguments) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [arguments],
    });
  } catch (e) {
    if (e.message.toLowerCase.includes("already verified")) {
      console.log("The contract already verified.");
    } else {
      console.log(e);
    }
  }
}

async function main() {
  const SBTArgs = ["Solyanka SBT", "Bubaleh", "...@gmail.com", 21];
  const SBToken = await hre.ethers.getContractFactory("SBToken");
  const SBTContract = await SBToken.deploy(
    SBTArgs[0],
    SBTArgs[1],
    SBTArgs[2],
    SBTArgs[3]
  );
  await SBTContract.deployed();
  console.log(`SBT deployed to ${SBTContract.address}`);

  const SolyankaToken = await hre.ethers.getContractFactory("SolyankaToken");
  const SolyankaTokenContract = await SolyankaToken.deploy();
  await SolyankaTokenContract.deployed();
  console.log(`Solyanka Token deployed to ${SolyankaTokenContract.address}`);

  const StakingArgs = [SolyankaTokenContract.address, SBTContract.address];
  const Staking = await hre.ethers.getContractFactory("Staking");
  const StakingContract = await Staking.deploy(StakingArgs[0], StakingArgs[1]);
  await StakingContract.deployed();
  console.log(`Staking deployed to ${StakingContract.address}`);

  const VotingFactoryArgs = SBTContract.address;
  const VotingFactory = await hre.ethers.getContractFactory("VotingFactory");
  const VotingFactoryContract = await VotingFactory.deploy(VotingFactoryArgs);
  await VotingFactoryContract.deployed();
  console.log(`Voting Factory deployed to ${VotingFactoryContract.address}`);

  if (network.config.chainId === 97) {
    SBTContract.deployTransaction.wait(15);
    verify(SBTContract.address, [SBTArgs]);
    console.log("SBT Contract verified!");

    SolyankaTokenContract.deployTransaction.wait(15);
    verify(SolyankaTokenContract.address, []);
    console.log("Solyanka Token Contract verified!");

    StakingContract.deployTransaction.wait(15);
    verify(StakingContract.address, [StakingArgs]);
    console.log("Staking Contract verified!");

    VotingFactoryContract.deployTransaction.wait(15);
    verify(VotingFactoryContract.address, [VotingFactoryArgs]);
    console.log("Voting Factory Contract verified!");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
