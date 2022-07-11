import { useContext } from "react";
import { toEth } from "./hook";
import { useWeb3React } from '@web3-react/core';
import { BURN_ADDR } from "../config";
import { ThemeConfig } from "../context";
import { useLuncContract, usePancakeSwapContract, useSwapContract } from "./useContract"

const useLiquidity = () => {
    const { account } = useWeb3React();
    const SwapContract = useSwapContract();
    const LuncContract = useLuncContract();
    const pancakeContract = usePancakeSwapContract();
    const { txFee } = useContext(ThemeConfig);

    const getBurnedAmount = async () => {
        const res = await LuncContract.methods.balanceOf(BURN_ADDR).call();
        console.log(res)
        return res;
    }

    const getAmountsOut = async (amountIn, path) => {
        try {
            const res = await pancakeContract.methods.getAmountsOut(toEth(amountIn), path).call();
            return res;
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    const onAddLiquidity = async (tokenA, tokenB, amountADesired, amountBDesired) => {
        if (!account) return;

        await SwapContract
            .methods
            .addLiquidity(tokenA, tokenB, toEth(amountADesired), toEth(amountBDesired), 0, 0, account, new Date().getTime() * 10)
            .send({ from: account, gasPrice: txFee.value });
    }

    const onSwap = async (amountIn, path) => {
        if (!account) return;
        await SwapContract
            .methods
            .swapExactTokensForTokens(toEth(amountIn), 0, path, account, new Date().getTime() * 10)
            .send({ from: account, gasPrice: txFee.value });
    }

    const getFees = async () => {
        const burnFee = await SwapContract.methods.burnFee().call();
        const profitFee = await SwapContract.methods.profitFee().call();

        return { burnFee, profitFee };
    }

    return {
        onSwap,
        getFees,
        getAmountsOut,
        onAddLiquidity,
        getBurnedAmount,
    }

}

export default useLiquidity;