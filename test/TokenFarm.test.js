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

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.strictEqual(result.toString(), toWeiTokens('100'), 'Incorrect investor Mock DAI wallet balance before staking');

            // Stake Mock DAI Tokens
            const stakeAmount = toWeiTokens('25');
            await daiToken.approve(tokenFarm.address, stakeAmount, { from: investor });
            await tokenFarm.stakeTokens(stakeAmount, { from: investor });


            // Check investor balance after staking
            result = await daiToken.balanceOf(investor);
            assert.strictEqual(result.toString(), toWeiTokens('75'), 'Incorrect investor Mock DAI wallet balance after staking');

            // Check tokenFarm accreditation after staking
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.strictEqual(result.toString(), toWeiTokens('25'), 'Incorrect tokenFarm accreditation after staking');

            // Check investor staking balance in tokenFarm after staking
            result = await tokenFarm.stakingBalance(investor);
            assert.strictEqual(result.toString(), toWeiTokens('25'), 'Incorrect investor staking balance in tokenFarm');

            // Check investor staking status
            result = await tokenFarm.isStaking(investor);
            assert.equal(result, true, 'Incorrect investor staking status');

            // Issue Tokens
            await tokenFarm.issueTokens({ from: owner })

            // Check balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), toWeiTokens('25'), 'Incorrect investor Dapp token wallet balance after token issuance')

            // Ensure that only onwer can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), toWeiTokens('100'), 'Incorect investor Mock Dai balance after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), toWeiTokens('0'), 'Incorect tokenFarm Mock Dai balance after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), toWeiTokens('0'), 'Incorrect investor staking balance after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result, false, 'Incorrect investor staking status after unstaking')

        })
    })

})