import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySaveEther() {
    const [owner, otherAccount] = await ethers.getSigners();
    const SaveEther = await ethers.getContractFactory("SaveEther");
    const deployedSaveEther = await SaveEther.deploy();

    return { deployedSaveEther, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("On deployment Contract balance should be zero", async function () {
      const { deployedSaveEther } = await loadFixture(deploySaveEther);
      const contractBalance = await deployedSaveEther.checkContractBal();
      expect(contractBalance).to.equal(0);
    });

    // it("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployOneYearLockFixture);

    //   expect(await lock.owner()).to.equal(owner.address);
    // });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployOneYearLockFixture
    //   );

    //   expect(await ethers.provider.getBalance(lock.target)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  describe("Deposit", function () {
    it(
      "On deposit of ether into the contract the balance of the depositor should increase by the amount deposited"
    ,
      async function () {
        const { deployedSaveEther, otherAccount } = await loadFixture(deploySaveEther);
        await deployedSaveEther.connect(otherAccount).deposit({ value: 1 });
        const savingsBalance = await deployedSaveEther.checkSavings(otherAccount)
        expect(savingsBalance).to.equal(1)
      })
  });

  
  describe("Deposit event", function () {
    it(
      "On deposit of ether into the contract an event should be emmited"
    ,
      async function () {
        const { deployedSaveEther, owner } = await loadFixture(deploySaveEther);
        const depositEther = await deployedSaveEther.connect(owner).deposit({ value: 1 });
        await expect(depositEther)
          .to.emit(deployedSaveEther, "SavingSuccessful")
          .withArgs(owner, 1);
      })
  });


  describe("withdraw", function () {
    it("On withdraw of an amount it should be deducted from the signers balance", async function () {
      const { deployedSaveEther, otherAccount } = await loadFixture(deploySaveEther);
      await deployedSaveEther.connect(otherAccount).deposit({ value: 1 });
      const availbleBalanceBeforeWithdrawal = await deployedSaveEther.checkSavings(otherAccount)
      await deployedSaveEther.connect(otherAccount).withdraw()
      const availbleBalanceAfterWithdrawal = await deployedSaveEther.checkSavings(otherAccount)
      expect(availbleBalanceAfterWithdrawal).to.be.lessThan(availbleBalanceBeforeWithdrawal)
    })
  })

  describe("sendOutSavings", function () {
    it("Check for amount sent out and balance after transfer", async function () {
      const { deployedSaveEther, owner, otherAccount } = await loadFixture(deploySaveEther);
      await deployedSaveEther.connect(otherAccount).deposit({ value: 10 });
      const availableBalanceBeforeTransfer =await deployedSaveEther.checkSavings(owner)
      const amount = 5
      await deployedSaveEther.connect(owner).sendOutSaving( otherAccount, 5 )
      const availableBalanceAfterTransfer =await deployedSaveEther.checkSavings(owner)
      // expect(availableBalanceAfterTransfer).to.equal(availableBalanceBeforeTransfer - amount)
    })
    
    
  })
  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
