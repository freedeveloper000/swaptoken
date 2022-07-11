import React from "react";
import Stack from '@mui/material/Stack';

const Layout = ({ children }) => {
    return (
        <Stack sx={{ height: '100%', backgroundColor: theme => theme.colors.bg, alignItems: 'center' }}>
            {children}
        </Stack>
    )
}

export default Layout;