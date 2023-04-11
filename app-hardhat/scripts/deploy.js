// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const constructorArgs = ["Bubaleh", "...@gmail.com", 21];
  const VotingFactory = await hre.ethers.getContractFactory("VotingFactory");
  const contarct = await VotingFactory.deploy(
    constructorArgs[0],
    constructorArgs[1],
    constructorArgs[2]
  );

  await contarct.deployed();

  console.log(`Contract deployed to ${contarct.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
