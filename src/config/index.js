import BigNumber from 'bignumber.js';

BigNumber.config({
    EXPONENTIAL_AT: 1000,
    DECIMAL_PLACES: 80
});

export const TESTNET = 97;
export const MAINNET = 56;

export const SlippageList = [0.5, 1, 3];
export const TxFeeList = [
    {
        title: 'Normal',
        value: '10000000000'
    },
    {
        title: 'Fast',
        value: '12000000000'
    },
    {
        title: 'Instant',
        value: '14000000000'
    }
];


export const BURN_ADDR = '0x000000000000000000000000000000000000dEaD';

export const CONTRACTS = {
    [TESTNET]: {
        PANCAKE: {
            address: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
            abi: require('./abis/pancake.json')
        },
        SWAP: {
            address: '0x00a4d13A4f92Ccf0E648B2B7Faddb4bf3C3e9697',
            abi: require('./abis/swap-test.json')
        },
        LUNC: {
            address: '0x38f1D732fec7ea0882368bBB14bc098C7b9f88b3',
            abi: require('./abis/erc20.json'),
            name: 'LUNC'
        },
        BUSD: {
            address: '0x8EE2A5B76448C06A52CA0782600d6E9F8DD74f8E',
            abi: require('./abis/erc20.json'),
            name: 'BUSD'
        },
    },
    [MAINNET]: {
        PANCAKE: {
            address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            abi: require('./abis/pancake.json')
        },
        SWAP: {
            address: '0x5D39952AAC6DB93c973CC67B474b09cdE58Ef22F',
            abi: require('./abis/swap.json')
        },
        LUNC: {
            address: '0xECCF35F941Ab67FfcAA9A1265C2fF88865caA005',
            abi: require('./abis/erc20.json'),
            name: 'LUNC'
        },
        BUSD: {
            address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            abi: require('./abis/erc20.json'),
            name: 'BUSD'
        },
    },
}