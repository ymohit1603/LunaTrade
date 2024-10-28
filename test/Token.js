const {expect}=require('chai')
const { ethers } = require("hardhat")

describe('Token', () => {
    let token
    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token=await Token.deploy('Mohit')
    })

    //Tests
    it('has a name', async () => {
        //Check if name is correct
        
        expect(await token.name()).to.equal("Mohit")
    })

    it('has correct symbol', async () => {   
        expect(await token.symbol()).to.equal('DAPP')
    })
})