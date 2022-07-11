import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import { CONTRACTS, MAINNET } from '../config';
import { useBusdContract, useLuncContract } from "./useContract";

const useAccount = () => {
    const { account } = useWeb3React();

    const LuncContract = useLuncContract();
    const BusdContract = useBusdContract();

    const getBalance = async () => {
        if (!account) return;

        const LUNC = await LuncContract.methods.balanceOf(account).call();
        const BUSD = await BusdContract.methods.balanceOf(account).call();

        return {
            LUNC,
            BUSD
        }
    }

    const getAllowance = async () => {
        if (!account) return;

        const LUNC = await LuncContract.methods.allowance(account, CONTRACTS[MAINNET].SWAP.address).call();
        const BUSD = await BusdContract.methods.allowance(account, CONTRACTS[MAINNET].SWAP.address).call();

        return {
            LUNC,
            BUSD
        }
    }

    const onApproveLunc = async () => {
        if (!account) return;

        await LuncContract
            .methods
            .approve(CONTRACTS[MAINNET].SWAP.address, new BigNumber('100000000000').times(new BigNumber(10).pow(18)).toString())
            .send({ from: account });
    }

    const onApproveBusd = async () => {
        if (!account) return;

        await BusdContract
            .methods
            .approve(CONTRACTS[MAINNET].SWAP.address, new BigNumber('100000000000').times(new BigNumber(10).pow(18)).toString())
            .send({ from: account });
    }

    const fetchTokenPrices = async () => {
        let busdPrice = 0;
        let luncPrice = 0;
        try {
            const response = await fetch(
                `https://api.pancakeswap.info/api/v2/tokens/${CONTRACTS[MAINNET].BUSD.address}`,
            )
            const { data } = await response.json()
            busdPrice = new BigNumber(data.price).toString();
        } catch (error) {
            console.log(error)
        }

        try {
            const response = await fetch(
                `https://api.pancakeswap.info/api/v2/tokens/${CONTRACTS[MAINNET].LUNC.address}`,
            )
            const { data } = await response.json()
            luncPrice = new BigNumber(data.price).toString();
        } catch (error) {
            console.log(error)
        }
        return {
            BUSD: busdPrice,
            LUNC: luncPrice
        }
    }

    return {
        getAllowance,
        onApproveLunc,
        getBalance,
        onApproveBusd,
        fetchTokenPrices
    }
}

export default useAccount;