import { useEffect, useState } from 'react'
import useWeb3 from './useWeb3'
import { CONTRACTS, MAINNET } from '../config/index.js'

const useContract = (abi, address, contractOptions) => {
  const web3 = useWeb3()
  const [contract, setContract] = useState(new web3.eth.Contract(abi, address, contractOptions))

  useEffect(() => {
    setContract(new web3.eth.Contract(abi, address, contractOptions))
  }, [abi, address, contractOptions, web3])

  return contract
}

/**
 * Helper hooks to get specific contracts (by ABI)
 */

export const useSwapContract = () => {
  return useContract(CONTRACTS[MAINNET].SWAP.abi, CONTRACTS[MAINNET].SWAP.address)
}

export const usePancakeSwapContract = () => {
  return useContract(CONTRACTS[MAINNET].PANCAKE.abi, CONTRACTS[MAINNET].PANCAKE.address)
}

export const useLuncContract = () => {
  return useContract(CONTRACTS[MAINNET].LUNC.abi, CONTRACTS[MAINNET].LUNC.address)
}

export const useBusdContract = () => {
  return useContract(CONTRACTS[MAINNET].BUSD.abi, CONTRACTS[MAINNET].BUSD.address)
}


export default useContract;