import { useAccount, useReadContract } from 'wagmi'
import styles from './cardBox.module.css'
import { CHARACTERCARD_ABI, GAME_ABI } from '@/app/ABI'
import { opBNBTestnet } from 'viem/chains'
import React, { useEffect, useState } from 'react'
import { config } from '@/app/Interloop'
import Image from 'next/image'
import { CHARACTERCARD_CONTRACTADDRESS } from '@/app/ADDRESSES'
import { TextHelper } from '@/app/charactercard/[id]/helper'
import { useRouter } from 'next/navigation'
export default function CardBox({
  children,
  className,
  onClick,
  showStats = true,
  width,
  height,
  borderRadius,
  style,
  tokenId,
}) {
  const router = useRouter()
  const [tokenuri, setTokenuri] = useState()
  const account = useAccount()
  const fetchUri = useReadContract({
    abi: CHARACTERCARD_ABI,
    address: CHARACTERCARD_CONTRACTADDRESS,
    functionName: 'tokenURI',
    config: config,
    args: [tokenId?.toString()],
    account: account,
    chainId: opBNBTestnet.id,
  })
  useEffect(() => {
    setTokenuri(fetchUri?.data)
    router.refresh()
  }, [])
  return (
    <div
      style={style}
      className={[styles.cardHolder, className ? className : ''].join(' ')}
    >
      {showStats ? (
        <div className={styles.StatusBar}>
          <span>H: 100</span>

          <span>A: 100</span>
        </div>
      ) : (
        ''
      )}
      <div
        className={styles.card}
        style={{ width: width, height: height, borderRadius: borderRadius }}
        onClick={onClick}
      >
        <div
          style={{
            position: 'relative',
            width: width,
            height: height,
            borderRadius: borderRadius,
          }}
        >
          {tokenId && tokenuri && (
            <Image sizes="20" priority src={tokenuri} fill alt="Picture" />
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function CardBoxGame({
  children,
  className,
  onClick,
  showStats = true,
  width,
  height,
  borderRadius,
  style,
  tokenId,
  gameaddress,
  displayActiveButton = false,
}) {
  const account = useAccount()
  const [tokenuri, setTokenuri] = useState()
  const result = useReadContract({
    abi: GAME_ABI,
    address: gameaddress,
    functionName: 'characterStatsInGame',
    config: config,
    args: [tokenId?.toString()],
    account: account,
    chainId: opBNBTestnet.id,
  })
  const fetchUri = useReadContract({
    abi: CHARACTERCARD_ABI,
    address: CHARACTERCARD_CONTRACTADDRESS,
    functionName: 'tokenURI',
    config: config,
    args: [tokenId?.toString()],
    account: account,
    chainId: opBNBTestnet.id,
  })

  useEffect(() => {
    setTokenuri(fetchUri?.data)
  }, [fetchUri])
  return (
    <div
      style={style}
      className={[styles.cardHolder, className ? className : ''].join(' ')}
    >
      {showStats ? (
        <div className={styles.StatusBar}>
          {result.data && (
            <span>H: {result.data && result.data[0].toString()}</span>
          )}

          {result.data && (
            <span>A: {result.data && result.data[1].toString()}</span>
          )}
        </div>
      ) : (
        ''
      )}

      <div
        className={styles.card}
        style={{ width: width, height: height, borderRadius: borderRadius }}
        onClick={onClick}
      >
        {console.log(tokenId, tokenuri)}
        <div
          style={{
            position: 'relative',
            width: '119px',
            height: '169px',
          }}
        >
          {tokenuri ? (
            <Image priority src={tokenuri} fill alt="Picture" />
          ) : (
            'Refresh page'
          )}
        </div>
        <div>{children}</div>
      </div>

      {displayActiveButton && <div className={styles.circle}></div>}
    </div>
  )
}
