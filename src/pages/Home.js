import React, { useContext, useEffect, useMemo, useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from "@mui/material/Divider";
import Skeleton from '@mui/material/Skeleton';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { Link } from "react-router-dom";
import { useWeb3React } from '@web3-react/core';

import { toEth, toInt } from "../hooks/hook"
import useAccount from "../hooks/useAccount";
import { CONTRACTS, MAINNET } from "../config";
import useLiquidity from "../hooks/useLiquidity";
import { ThemeConfig } from "../context/index";
import { CustomInput } from "../components/CustomComponent";

const Home = () => {
    const { account } = useWeb3React();
    const { Slippage } = useContext(ThemeConfig);

    const [fees, setFees] = useState({})
    const [burned, setBurned] = useState();
    const [approved, setApproved] = useState({
        LUNC: 0,
        BUSD: 0
    });
    const [balances, setBalances] = useState({})
    const [initialPrice, setInitialPrice] = useState({
        LUNC: 0,
        BUSD: 0
    })

    const { getAmountsOut, onSwap, getFees, getBurnedAmount } = useLiquidity();
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

    const handleConvertCurrency = async () => {
        setCurrencys(prev => {
            const temp = [prev[1], prev[0]];
            return [...temp];
        })

        const res = await getAmountsOut(1, [currencys[1].address, currencys[0].address]);
        let cur = {};
        cur[currencys[1].name] = res[0];
        cur[currencys[0].name] = res[1];
        setInitialPrice(cur);

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

    const handleAddLiquidity = async () => {
        const path = currencys.map(cur => cur.address);
        await onSwap(
            currencys[0].typeInput,
            path,
        );
        const balances = await getBalance();
        setBalances(balances);
    }

    useEffect(() => {
        (async () => {
            if (account) {
                const balances = await getBalance();
                const allowed = await getAllowance();
                const path = currencys.map(cur => cur.address);
                const res = await getAmountsOut(1, path);
                const fee = await getFees();
                const _burn = await getBurnedAmount();
                setBalances(balances);
                setApproved(allowed);
                setInitialPrice({ LUNC: res[0], BUSD: res[1] });
                setBurned(_burn);
                setFees(fee)
            }
        })()

    }, [account])


    return (
        <Stack
            sx={{
                width: theme => theme.isMobile ? '100%' : theme.isTablet ? '80%' : '60%',
                height: '100%',
                mt: theme => theme.isMobile ? 15 : 20
            }}
            direction='row'
            justifyContent={'center'}
        >
            <Stack>
                <Stack
                    sx={{
                        border: theme => `2px solid ${theme.colors.active}`,
                        borderRadius: 3,
                        pt: 4,
                        pb: 6,
                        px: 3,
                        width: theme => theme.isMobile ? '100%' : '450px'
                    }}
                    spacing={2}
                >
                    <Stack direction='row' alignItems='center' justifyContent={'space-between'}>
                        <Stack direction='row' spacing={2}>
                            <Button
                                disableRipple
                                sx={{
                                    padding: 0,
                                    background: 'transparent',
                                    fontWeight: 'bold',
                                    color: 'black',
                                    '&:hover': {
                                        background: 'transparent',
                                        color: theme => theme.colors.black
                                    }
                                }}
                            >
                                Swap
                            </Button>
                            <Link to={'/liquidity'} style={{ textDecoration: 'none' }} >
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
                                    Add Liquidity
                                </Button>
                            </Link>
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
                            <Stack spacing={0.5} sx={{ width: '70%' }}>
                                <CustomInput value={currencys[0].typeInput} onChange={e => handleCalc(0, e.target.value)} placeholder={'0'} />
                                <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                    $0.00
                                </Typography>
                            </Stack>
                            <Stack sx={{ width: '30%' }} justifyContent="space-between" >
                                <Button
                                    sx={{
                                        borderRadius: 10,
                                        fontWeight: 'bold',
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
                            <Stack spacing={0.5} sx={{ width: '70%' }}>
                                <CustomInput value={currencys[1].typeInput} onChange={e => handleCalc(1, e.target.value)} placeholder={'0'} />
                                <Typography sx={{ color: theme => theme.colors.text2 }} fontSize={12}>
                                    $0.00
                                </Typography>
                            </Stack>
                            <Stack sx={{ width: '30%' }} justifyContent="space-between" >
                                <Button
                                    sx={{
                                        borderRadius: 10,
                                        fontWeight: 'bold',
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
                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                <ErrorOutlineIcon fontSize="small" />
                                <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: 12 }}>
                                    {`${toInt(initialPrice[currencys[0].name], 0)} ${currencys[0].name}`} = {`${toInt(initialPrice[currencys[1].name], 3)} ${currencys[1].name}`}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    '& svg': {
                                        color: theme => theme.colors.red
                                    }
                                }}
                            >
                                <LocalFireDepartmentIcon fontSize="small" />
                                {
                                    fees.burnFee ?
                                        <Typography sx={{ color: theme => theme.colors.text2, fontSize: 12 }}>
                                            {fees.burnFee / 100}%
                                        </Typography>
                                        :
                                        <Skeleton width={30} variant="text" />
                                }
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack
                        sx={{
                            border: theme => `2px solid ${theme.colors.elements}`,
                            borderRadius: 3,
                            px: 2,
                            py: 1
                        }}
                    >
                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Typography sx={{ fontSize: 12, color: theme => theme.colors.text2 }}>
                                Expected OutPut
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    my: 1.5,
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>
                                    {`${currencys[1].typeInput} ${currencys[1].name}`}
                                </Typography>
                                <ErrorOutlineIcon fontSize="small" />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Typography sx={{ fontSize: 12, color: theme => theme.colors.text2 }}>
                                Minimum received after slippage ({Slippage}%)
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    my: 1.5,
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>
                                    {`${(currencys[1].typeInput - (currencys[1].typeInput * Slippage / 100)).toFixed(4)} ${currencys[1].name}`}
                                </Typography>
                                <ErrorOutlineIcon fontSize="small" />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Typography sx={{ fontSize: 12, color: theme => theme.colors.text2 }}>
                                Metwork Fee
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    my: 1.5,
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>
                                    $2.72
                                </Typography>
                                <ErrorOutlineIcon fontSize="small" />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Typography sx={{ fontSize: 12, color: theme => theme.colors.text2 }}>
                                Total Burned Amount
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    my: 1.5,
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>
                                    {toInt(burned, 2)}
                                </Typography>
                                <ErrorOutlineIcon fontSize="small" />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems='center' justifyContent='space-between'>
                            <Typography sx={{ fontSize: 12, color: theme => theme.colors.text2 }}>
                                Exchange Fee
                            </Typography>
                            <Stack
                                direction="row"
                                alignItems='center'
                                spacing={0.5}
                                sx={{
                                    my: 1.5,
                                    '& svg': {
                                        color: theme => theme.colors.text2
                                    }
                                }}
                            >
                                {
                                    fees.burnFee ?
                                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>
                                            {fees.burnFee / 100}% + {fees.profitFee / 100}%
                                        </Typography>
                                        :
                                        <Skeleton width={90} variant="text" />
                                }
                                <ErrorOutlineIcon fontSize="small" />
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
                                            Swap
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
                                            onClick={handleAddLiquidity}
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
                                            Swap
                                        </Button>
                                    );
                            }

                        })()}
                    </Stack>
                </Stack>
            </Stack>
        </Stack >
    )
}

export default Home;