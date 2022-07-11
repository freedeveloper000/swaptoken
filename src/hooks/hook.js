import BigNumber from 'bignumber.js';

export const toEth = (_amount, decimal = 18) => {
    return new BigNumber(_amount).times(new BigNumber(10).pow(decimal)).toString();
}

export const toInt = (_amount, fix = 0, decimal = 18) => {
    const num = new BigNumber(_amount).div(new BigNumber(10).pow(decimal)).toNumber().toFixed(fix + 1).toString().slice(0, -1);

    if (num[num.length - 1] == ".") return num.slice(0, num.length - 1);
    return Number(num);
}

