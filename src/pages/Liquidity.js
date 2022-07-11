import React, { useContext, useEffect, useMemo, useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import useTheme from '@mui/material/styles/useTheme';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { Link } from "react-router-dom";
import { useWeb3React } from '@web3-react/core';

import { toEth, toInt } from "../hooks/hook"
import useAccount from "../hooks/useAccount";
import { CustomInput } from "../components/CustomComponent";
import { CONTRACTS, MAINNET } from "../config";
import useLiquidity from "../hooks/useLiquidity";
import { ThemeConfig } from "../context/index";

const Liquidity = () => {
    const theme = useTheme();
    const { account } = useWeb3React();
    const { Slippage } = useContext(ThemeConfig);

    const [burned, setBurned] = useState();
    const [approved, setApproved] = useState({
        LUNC: 0,
        BUSD: 0
    });
    const [balances, setBalances] = useState({})

    const { getAmountsOut, onAddLiquidity, getBurnedAmount } = useLiquidity();
    const { getBalance, getAllowance, onApproveLunc, onApproveBusd } = useAccount()

    const [currencys, setCurrencys] = useState([
        {
            address: CONTRACTS[MAINNET].LUNC.address,
            name: CONTRACTS[MAINNET].LUNC.name,
            typeInput: 0
        },
        {
            address: CONTRACTS[MAINNET].BUSD.address,
            name: CONTRACTS[MAINNET].BUSD.name,
            typeInput: 0
        },
    ]);

    const allowance = useMemo(() => {
        if (!currencys[0].typeInput || !currencys[1].typeInput) {
            return { status: 'amount', title: 'Input correct amount' }
        };

        if (Number(currencys[1].typeInput) > Number(balances[currencys[1].name])) {
            return { status: 'balance', currency: 1 };
        }

        if (Number(currencys[0].typeInput) > Number(balances[currencys[0].name])) {
            return { status: 'balance', currency: 0 };
        }

        if (Number(toEth(currencys[0].typeInput)) > Number(approved[currencys[0].name])) {
            return { status: 'approve', currency: 0 };
        }

        if (Number(toEth(currencys[1].typeInput)) > Number(approved[currencys[1].name])) {
            return { status: 'approve', currency: 1 };
        }

        return { status: true };
    }, [approved, currencys])

    const haldneApprove = async (currency) => {
        if (currency == 'LUNC') {
            await onApproveLunc();
        } else {
            await onApproveBusd();
        }
        const allowed = await getAllowance();
        setApproved(allowed);
    }

    const handleConvertCurrency = () => {
        setCurrencys(prev => {
            const temp = [prev[1], prev[0]];
            return [...temp];
        })
    }

    const handleCalc = async (i, value) => {
        setCurrencys(prev => {
            prev[i].typeInput = value;
            return [...prev];
        })

        if (!value || value == 0) {
            return setCurrencys(prev => {
                prev[i === 0 ? 1 : 0].typeInput = 0;
                return [...prev];
            })
        };

        let path = [];

        if (i === 0) {
            path = currencys.map(cur => cur.address);
        } else {
            path[0] = currencys[1].address;
            path[1] = currencys[0].address;
        }

        const res = await getAmountsOut(value, path);

        setCurrencys(prev => {
            prev[i == 0 ? 1 : 0].typeInput = toInt(res[1], 4);
            return [...prev];
        })
    }

    const handleSwap = async () => {
        await onAddLiquidity(
            currencys[0].address,
            currencys[1].address,
            currencys[0].typeInput,
            currencys[1].typeInput,
        );
        const balances = await getBalance();
        setBalances(balances);
    }

    useEffect(() => {
        (async () => {
            if (account) {
                const balances = await getBalance();
                const allowed = await getAllowance();
                const _burn = await getBurnedAmount();
                setBalances(balances);
                setApproved(allowed);
                setBurned(_burn);
            }
        })()

    }, [account])


    return (
        <Stack
            sx={{
                width: theme => theme.isMobile ? '100%' : theme.isTablet ? '80%' : '60%',
                height: 'fig-content',
                mt: theme => theme.isMobile ? 15 : 20,
                p: theme.isMobile ? 0 : 3,
            }}
            direction='row'
        >
            <Stack
                sx={{
                    border: theme => `2px solid ${theme.colors.red}`,
                    borderRadius: 3,
                    width: '100%'
                }}
                justifyContent={'space-between'}
                alignItems='center'
                direction={theme.isMobile ? 'column' : 'row'}
            >
                <Stack justifyContent={'center'}>
                    <Stack
                        sx={{
                            pt: 8,
                            pb: 12,
                            px: 1,
                            pl: theme.isMobile ? 1 : 6,
                            width: theme.isMobile ? '100%' : '450px'
                        }}
                        spacing={2}
                    >
                        <Stack direction='row' alignItems='center' justifyContent={'space-between'}>
                            <Stack direction='row' spacing={2}>
                                <Link to={'/'} style={{ textDecoration: 'none' }} >
                                    <Button
                                        disableRipple
                                        sx={{
                                            padding: 0,
                                            background: 'transparent',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                background: 'transparent',
                                                color: theme => theme.colors.black
                                            }
                                        }}
                                    >
                                        Swap
                                    </Button>
                                </Link>
                                <Button
                                    disableRipple
                                    sx={{
                                        padding: 0,
                                        background: 'transparent',
                                        fontWeight: 'bold',
                                        color: theme => theme.colors.red,
                                        '&:hover': {
                                            background: 'transparent',
                                            color: theme => theme.colors.red
                                        }
                                    }}
                                >
                                    Add Liquidity
                                </Button>
                            </Stack>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Typography fontSize={13}>
                                    Slippage: {Slippage}%
                                </Typography>
                                <Stack direction='row'>
                                    <Link to={'/setting'} style={{ textDecoration: 'none' }} >
                                        <IconButton>
                                            <SettingsOutlinedIcon />
                                        </IconButton>
                                    </Link>
                                </Stack>
                            </Stack>
                        </Stack>

                        <Stack>
                            <Stack
                                sx={{
                                    border: theme => `2px solid ${theme.colors.elements}`,
                                    borderRadius: 3,
                                    p: 2
                                }}
                                direction='row'
                            >
                                <Stack spacing={0.5} sx={{ width: '100%' }}>
                                    <CustomInput value={currencys[0].typeInput} onChange={e => handleCalc(0, e.target.value)} placeholder={'0'} />
                                    <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                        $0.00
                                    </Typography>
                                </Stack>
                                <Stack sx={{ width: 'fig-content' }} justifyContent="space-between" alignItems={'end'} >
                                    <Button
                                        sx={{
                                            borderRadius: 10,
                                            fontWeight: 'bold',
                                            width: '100px',
                                            color: theme => theme.colors.black,
                                            '& svg': {
                                                fontSize: '15px !important'
                                            }
                                        }}
                                        endIcon={
                                            <ArrowForwardIosIcon />
                                        }
                                    >
                                        {currencys[0].name}
                                    </Button>
                                    {
                                        account && (
                                            <Stack alignItems="center" direction='row' justifyContent="end" >
                                                <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                                    balance:
                                                </Typography>
                                                {
                                                    balances[currencys[0].name] ?
                                                        <Typography sx={{ color: theme => theme.colors.blue }} fontSize={12}>
                                                            &nbsp;{toInt(balances[currencys[0].name], 3)}
                                                        </Typography>
                                                        :
                                                        <Skeleton width={50} variant="text" />
                                                }
                                            </Stack>
                                        )
                                    }
                                </Stack>
                            </Stack>

                            <Stack alignItems="center" justifyContent="center">
                                <IconButton
                                    onClick={handleConvertCurrency}
                                    sx={{
                                        my: -1.5,
                                        border: theme => `2px solid ${theme.colors.elements}`,
                                        background: theme => theme.colors.bg,
                                        '& svg': {
                                            color: theme => theme.colors.blue
                                        },
                                        '&:hover': {
                                            background: theme => theme.colors.bg,
                                        }
                                    }}
                                >
                                    <SwapVertIcon />
                                </IconButton>
                            </Stack>

                            <Stack
                                sx={{
                                    border: theme => `2px solid ${theme.colors.elements}`,
                                    borderRadius: 3,
                                    p: 2
                                }}
                                direction='row'
                            >
                                <Stack spacing={0.5} sx={{ width: '100%' }}>
                                    <CustomInput value={currencys[1].typeInput} onChange={e => handleCalc(1, e.target.value)} placeholder={'0'} />
                                    <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                        $0.00
                                    </Typography>
                                </Stack>
                                <Stack sx={{ width: 'fig-content' }} justifyContent="space-between" alignItems={'end'} >
                                    <Button
                                        sx={{
                                            borderRadius: 10,
                                            fontWeight: 'bold',
                                            width: '100px',
                                            color: theme => theme.colors.black,
                                            '& svg': {
                                                fontSize: '15px !important'
                                            }
                                        }}
                                        endIcon={
                                            <ArrowForwardIosIcon />
                                        }
                                    >
                                        {currencys[1].name}
                                    </Button>
                                    {
                                        account && (
                                            <Stack alignItems="center" direction='row' justifyContent="end" >
                                                <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                                    balance:
                                                </Typography>
                                                {
                                                    balances[currencys[1].name] ?
                                                        <Typography sx={{ color: theme => theme.colors.blue }} fontSize={12}>
                                                            &nbsp;{toInt(balances[currencys[1].name], 3)}
                                                        </Typography>
                                                        :
                                                        <Skeleton width={50} variant="text" />
                                                }
                                            </Stack>
                                        )
                                    }
                                </Stack>
                            </Stack>
                        </Stack>

                        <Stack>
                            {(() => {
                                switch (allowance.status) {
                                    case 'amount':
                                        return (
                                            <Button
                                                disabled={true}
                                                sx={{
                                                    background: theme => theme.colors.desabled,
                                                    borderRadius: 10,
                                                    height: 45,
                                                    color: theme => `${theme.colors.inputs} !important`,
                                                    '&:hover': {
                                                        background: theme => theme.colors.black,
                                                    }
                                                }}
                                            >
                                                Add liquidity
                                            </Button>
                                        )
                                    case 'balance':
                                        return <Button
                                            disabled={true}
                                            sx={{
                                                background: theme => theme.colors.desabled,
                                                borderRadius: 10,
                                                height: 45,
                                                color: theme => `${theme.colors.inputs} !important`,
                                                '&:hover': {
                                                    background: theme => theme.colors.black,
                                                }
                                            }}
                                        >
                                            Balance is not enough
                                        </Button>
                                    case 'approve':
                                        return <Button
                                            sx={{
                                                background: theme => theme.colors.red,
                                                borderRadius: 10,
                                                height: 45,
                                                color: theme => theme.colors.inputs,
                                                '&:hover': {
                                                    background: theme => theme.colors.red,
                                                }
                                            }}
                                            onClick={() => haldneApprove(currencys[allowance.currency].name)}
                                        >
                                            {
                                                account ?
                                                    (
                                                        `Approve ${currencys[allowance.currency].name}`
                                                    ) : (
                                                        'Connect Wallet'
                                                    )
                                            }
                                        </Button>
                                    default:
                                        return (
                                            <Button
                                                onClick={handleSwap}
                                                disabled={!currencys[0].typeInput || !currencys[1].typeInput}
                                                sx={{
                                                    background: theme => !currencys[0].typeInput || !currencys[1].typeInput ? theme.colors.desabled : theme.colors.black,
                                                    borderRadius: 10,
                                                    height: 45,
                                                    color: theme => `${theme.colors.inputs} !important`,
                                                    '&:hover': {
                                                        background: theme => theme.colors.black,
                                                    }
                                                }}
                                            >
                                                Add liquidity
                                            </Button>
                                        );
                                }

                            })()}
                        </Stack>
                    </Stack>
                </Stack>

                <Stack
                    sx={{
                        width: '100%',
                        pb: 10
                    }}
                >
                    <Stack
                        justifycontent='center'
                        alignItems='center'
                        spacing={3}
                    >
                        <Typography sx={{ fontSize: 28, color: theme => theme.colors.red }}>
                            TOTAL LUNC BURNED
                        </Typography>
                        {
                            burned ?
                                <Typography sx={{ fontSize: 24, color: theme => theme.colors.red }}>
                                    {toInt(burned, 2)}
                                </Typography>
                                :
                                <Skeleton width={50} height={36} />
                        }
                    </Stack>
                </Stack>
            </Stack>
        </Stack >
    )
}

export default Liquidity;