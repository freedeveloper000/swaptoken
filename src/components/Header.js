import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { useWeb3React } from '@web3-react/core';
import { injected, netId, RPC_URL } from '../utils/connectors';
import { ReactComponent as WalletIcon } from '../assets/img/wallets/wallet.svg';

export default function Header() {
    const { active, account, chainId, activate, deactivate } = useWeb3React();
    const [open, setOpen] = React.useState(false);

    const handleConnect = () => {
        activate(injected)
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDisconnect = () => {
        deactivate();
        handleClose();
    };

    const switchNetwork = () => {
        if (window.ethereum) {
            window.ethereum
                .request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: `0x${netId.toString(16)}`,
                            chainName: "Binance Smart Chain",
                            rpcUrls: [
                                RPC_URL
                            ],
                            nativeCurrency: {
                                name: "BNB",
                                symbol: "BNB",
                                decimals: 18,
                            },
                            blockExplorerUrls: [
                                "https://bscscan.com",
                            ],
                        },
                    ],
                });
        }
    };

    useEffect(() => {
        if (chainId !== netId) {
            switchNetwork();
            if (!active) {
                activate(injected);
            }
        } else {
            if (!active) {
                activate(injected);
            }
        }
    }, [])

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" sx={{ background: 'black' }}>
                <Toolbar sx={{ alignSelf: 'center', width: theme => theme.isMobile ? '95%' : theme.isTablet ? '80%' : '60%' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        SWAP
                    </Typography>
                    {
                        account ? (
                            <Button
                                onClick={handleClickOpen}
                                startIcon={
                                    <WalletIcon style={{ width: 20, height: 20 }} />
                                }
                                variant="outlined"
                                sx={{
                                    color: theme => theme.colors.green,
                                    borderRadius: 2,
                                    borderColor: theme => theme.colors.green,
                                    background: theme => theme.colors.whiteblack,
                                    minWidth: 120,
                                    '&:hover': {
                                        borderColor: theme => theme.colors.green
                                    },
                                    '& svg': {
                                        fill: theme => theme.colors.green
                                    }
                                }}
                            >
                                {account.slice(0, 6)} ... {account.slice(-4)}
                            </Button>
                        ) : (
                            <Button
                                startIcon={
                                    <WalletIcon style={{ width: 20, height: 20 }} />
                                }
                                variant="outlined"
                                sx={{
                                    color: theme => theme.colors.green,
                                    borderRadius: 2,
                                    borderColor: theme => theme.colors.green,
                                    background: theme => theme.colors.whiteblack,
                                    minWidth: 120,
                                    '&:hover': {
                                        borderColor: theme => theme.colors.green
                                    },
                                    '& svg': {
                                        fill: theme => theme.colors.green
                                    }
                                }}
                                onClick={handleConnect}
                            >
                                Connect Wallet
                            </Button>
                        )
                    }
                </Toolbar>
            </AppBar>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: theme => theme.colors.green }}>
                    {"Your Wallet Address"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: theme => theme.colors.green }} id="alert-dialog-description">
                        {account}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        sx={{
                            background: 'white',
                            border: theme => `1px solid ${theme.colors.green}`,
                            color: theme => theme.colors.green,
                            fontWeight: 'bold'
                        }}
                    >CLOSE</Button>
                    <Button
                        onClick={handleDisconnect}
                        sx={{
                            background: theme => theme.colors.green,
                            color: 'white'
                        }}
                    >
                        DISCONNECT
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
