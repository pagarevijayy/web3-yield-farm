/* eslint-disable no-undef */
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function toWeiTokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm;

    before(async () => {
        // Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address)

        // Transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, toWeiTokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, toWeiTokens('100'), { from: owner })
    })

    describe('Mock Dai deployed', async () => {
        it('has name', async () => {
            const mDaiName = await daiToken.name()
            assert.equal(mDaiName, "Mock DAI Token")
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.strictEqual(balance.toString(), toWeiTokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {

        it('rewards investors for staking mDai tokens', async () => {
            let result;

            // check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.strictEqual(result.toString(), toWeiTokens('100'), 'Correct investor Mock DAI wallet balance before staking');

            // Stake Mock DAI Tokens
            const stakeAmount = toWeiTokens('25');
            await daiToken.approve(tokenFarm.address, stakeAmount, { from: investor });
            await tokenFarm.stakeTokens( stakeAmount, { from: investor })


            // check investor balance after staking
            // result = await daiToken.balanceOf(investor);
            // assert.strictEqual(result.toString(), toWeiTokens('75'), 'Incorrect staking')
        })
    })

})