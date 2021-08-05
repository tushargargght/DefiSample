const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    // Load contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    await daiToken.transfer(investor, tokens('100'), { from: owner })
  })

  describe('Mock Dai deployment', async () => {
    it('has a name', async () => {
      let name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp token deployment', async () => {
    it('has a name', async () => {
      let name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      let name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    it('has million Dapp tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {

    it('rewards investors for staking mDai tokens', async () => {
      let result

      // Check balance before staking
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), "investor dai wallet balance incorrect before staking")

      await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), "investor dai wallet balance incorrect after staking")

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), "tokenFarm dai wallet balance incorrect after staking")

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), "investor staking balance incorrect after staking")

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', "investor is staking")

      await tokenFarm.issueTokens({ from: owner})

      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), "issue balance of investor is incorrect")

      await tokenFarm.issueToken({ from: investor }).should.be.rejected;
      
      await tokenFarm.unstakeTokens({ from: investor})
      // Unstaking tests ... leaving for now
    })
  })
})
