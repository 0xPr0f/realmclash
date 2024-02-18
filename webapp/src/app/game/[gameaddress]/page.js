'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './game.css'
import CardBox, { CardBoxGame } from '@/app/components/cardBox/cardBox'
import BoxButton from '@/app/components/boxButton/boxButton'
import { useReadContract, useAccount, useWriteContract } from 'wagmi'
import { GAME_ABI } from '@/app/ABI'
import Tooltip from '@/app/components/toolTip/toolTip'
import EmptyView from '@/app/components/emptyView/emptyView'
import { GiCrossedSwords, GiSwordWound, GiPointySword } from 'react-icons/gi'
import { FaRotate, FaArrowsRotate } from 'react-icons/fa6'
import { opBNBTestnet } from 'viem/chains'
import { useWatchContractEvent } from 'wagmi'
import { config } from '@/app/Interloop'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { Button, notification } from 'antd'
import { IoClose } from 'react-icons/io5'
import { FaCheck } from 'react-icons/fa'

export default function GameRoom({ params }) {
  const router = useRouter()
  const account = useAccount()
  const { address } = useAccount()
  //const { writeContract } = useWriteContract();
  const [selectedCard, setSelectedCard] = useState(null)
  const [allYourCardsInGame, setAllYourCardsInGame] = useState()
  const [allOppositeCardsInGame, setAllOppositeCardsInGame] = useState()
  const [oppositePlayerAddress, setOppositePlayerAddress] = useState()
  const [ActiveCharacter, setActiveCharacter] = useState()
  const [MatchDetails, setMatchDetails] = useState()
  const [isLoadingATX, setIsLoadingATX] = useState()
  const [api, contextHolder] = notification.useNotification()
  const openNotification = ({ _message, _description, _duration, _icon }) => {
    api.open({
      message: _message,
      description: _description,
      duration: _duration || 2,
      icon: _icon,
    })
  }
  const handleCardClick = (index) => {
    setSelectedCard((prevSelectedCard) => {
      return prevSelectedCard === index ? null : index
    })
  }
  const checkIfSelectedCharacter = (id) => {
    if (!(id && selectedCard)) {
      setIsLoadingATX(false)
      openNotification({
        _message: 'Invalid Card',
        _description: 'No card selected, Select and card',
        _icon: <IoClose size={30} color="#c3073f" />,
      })
    }
  }
  const matchDetails = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'matchDetails',
    config: config,
    account: account,
    chainId: opBNBTestnet.id,
  })
  const activeCharacter = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'getActiveCharacter',
    args: [address],
    account: account,
    config: config,
    account: account,
    chainId: opBNBTestnet.id,
  })
  const charactersTokenIdsY = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'returnAddressToCharacterIdIngame',
    args: [address],
    config: config,
    account: account,
    chainId: opBNBTestnet.id,
  })
  const charactersTokenIdsO = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'returnAddressToCharacterIdIngame',
    args: [oppositePlayerAddress],
    config: config,
    account: account,
    chainId: opBNBTestnet.id,
  })
  const returnOtherAddress = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'returnOtherPlayer',
    args: [address],
    account: account,
    config: config,
    account: account,
    chainId: opBNBTestnet.id,
  })
  const isAddressInGame = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'checkAddressIsInGame',
    account: account,
    config: config,
    chainId: opBNBTestnet.id,
  })
  const powerPointCount = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'playerToDiceRow',
    account: account,

    chainId: opBNBTestnet.id,
  })
  const timeToULTCount = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'timeForUlt',
    args: [account],
    account: account,
    chainId: opBNBTestnet.id,
  })
  const addressToPlay = useReadContract({
    abi: GAME_ABI,
    address: params.gameaddress,
    functionName: 'addressToPlay',
    args: [address],
    account: account,
    chainId: opBNBTestnet.id,
  })
  const useNormalAttack = async (tokenId) => {
    console.log(selectedCard)
    if (!(tokenId && selectedCard)) {
      return checkIfSelectedCharacter(tokenId)
    }
    try {
      setIsLoadingATX(true)
      await writeContract(config, {
        abi: GAME_ABI,
        address: params.gameaddress,
        functionName: 'useNormalAttack',
        args: [tokenId.toString()],
        account: account,
      })
      console.log(selectedCard)
      openNotification({
        _message: 'Used Normal Attack',
        _description: `Token ID: ${selectedCard}`,
        _icon: <FaCheck size={30} color="#c3073f" />,
      })
      setIsLoadingATX(false)
    } catch (e) {
      setIsLoadingATX(false)
      openNotification({
        _message: 'Used Normal Attack',
        _description: 'Move Unsuccessful',
        _icon: <IoClose size={30} color="#c3073f" />,
      })
    }
  }
  const useULT2Attack = async (tokenId) => {
    if (!(tokenId && selectedCard)) {
      return checkIfSelectedCharacter(tokenId)
    }
    try {
      setIsLoadingATX(true)
      await writeContract(config, {
        abi: GAME_ABI,
        address: params.gameaddress,
        functionName: 'useUlt2Attack',
        args: [tokenId.toString()],
        account: account,
      })
      console.log(selectedCard)

      openNotification({
        _message: 'Used ULT2 Attack',
        _description: `Token ID: ${selectedCard}`,
        _icon: <FaCheck size={30} color="#c3073f" />,
      })
      setIsLoadingATX(false)
    } catch (e) {
      setIsLoadingATX(false)
      openNotification({
        _message: 'Used ULT2 Attack',
        _description: 'Move Unsuccessful',
        _icon: <IoClose size={30} color="#c3073f" />,
      })
    }
  }
  const useULT3Attack = async (tokenId) => {
    if (!(tokenId && selectedCard)) {
      return checkIfSelectedCharacter(tokenId)
    }
    try {
      setIsLoadingATX(true)
      await writeContract(config, {
        abi: GAME_ABI,
        address: params.gameaddress,
        functionName: 'useUlt3Attack',
        args: [tokenId.toString()],
        account: account,
      })
      console.log(selectedCard)
      openNotification({
        _message: 'Used ULT3 Attack',
        _description: `Token ID: ${selectedCard}`,
        _icon: <FaCheck size={30} color="#c3073f" />,
      })
      setIsLoadingATX(false)
    } catch (e) {
      setIsLoadingATX(false)
      openNotification({
        _message: 'Used ULT3 Attack',
        _description: 'Move Unsuccessful',
        _icon: <IoClose size={30} color="#c3073f" />,
      })
    }
  }
  const switchCharacter = async (tokenId) => {
    if (!(tokenId && selectedCard)) {
      return checkIfSelectedCharacter(tokenId)
    }
    try {
      setIsLoadingATX(true)
      await writeContract(config, {
        abi: GAME_ABI,
        address: params.gameaddress,
        functionName: 'setSwitchActiveCharacter',
        args: [tokenId.toString()],
        account: account,
      })

      openNotification({
        _message: 'Used Character Switch',
        _description: `Plotting a strategic switch to Token ID: ${selectedCard}`,
        _duration: 3,
        _icon: <FaCheck color="#c3073f" />,
      })
      console.log(selectedCard)
      setIsLoadingATX(false)
    } catch (e) {
      setIsLoadingATX(false)
      openNotification({
        _message: 'Switch character',
        _description: `Move Unsuccessful`,
        _icon: <IoClose color="#c3073f" />,
      })
    }
  }
  useEffect(() => {
    setOppositePlayerAddress(returnOtherAddress?.data)
    setAllYourCardsInGame(charactersTokenIdsY?.data)
    setMatchDetails(matchDetails?.data)
    setAllOppositeCardsInGame(charactersTokenIdsO?.data)
  }, [charactersTokenIdsY, returnOtherAddress])
  useEffect(() => {
    setActiveCharacter(activeCharacter.data)
  }, [activeCharacter])

  useWatchContractEvent({
    address: params?.gameaddress,
    abi: GAME_ABI,
    eventName: 'setSwitchCharacter',
    onLogs(logs) {
      console.log('SwitchCharacter logs:', logs)
      setActiveCharacter(activeCharacter?.data)
    },
  })
  useWatchContractEvent({
    address: params?.gameaddress,
    abi: GAME_ABI,
    eventName: 'TakeDamage',
    onLogs(logs) {
      console.log('Take Damage logs:', logs)
      setAllYourCardsInGame(charactersTokenIdsY?.data)
      setAllOppositeCardsInGame(charactersTokenIdsO?.data)
    },
  })

  useWatchContractEvent({
    address: params?.gameaddress,
    abi: GAME_ABI,
    eventName: 'GameWon',
    onLogs(logs) {
      console.log('Game won:', logs)
      setMatchDetails(matchDetails?.data)
    },
  })

  return (
    <div>
      {console.log(ActiveCharacter?.toString())}
      {contextHolder}
      <div style={{ padding: '20px' }}>
        address : {JSON.stringify(params.gameaddress)}
      </div>
      {params.gameaddress.length === 42 ? (
        <div>
          <div className="game-board">
            <div className="cards-up">
              {
                /*allOppositeCardsInGame || */
                [1, 2, 3]?.map((cardId) => (
                  <CardBoxGame key={cardId}>
                    Card {cardId.toString()}
                  </CardBoxGame>
                ))
              }
            </div>
            <div className="cardsdown">
              <div className="buttons">
                <BoxButton
                  disabled={isLoadingATX}
                  outsidePadding="20px"
                  borderRadius="100%"
                  height="40px"
                  width="40px"
                  onClick={async () => {
                    console.log('use button check if disabled')
                    switchCharacter(selectedCard)
                  }}
                >
                  <FaArrowsRotate size={20} fontWeight={1} />
                </BoxButton>
              </div>
              <div className="cards-down">
                {allYourCardsInGame?.map((cardId) => (
                  <CardBoxGame
                    displayActiveButton={
                      Number(ActiveCharacter?.toString()) === Number(cardId)
                    }
                    gameaddress={params.gameaddress}
                    tokenId={cardId}
                    key={cardId}
                    className={`card ${
                      selectedCard === Number(cardId) ? 'selected' : ''
                    }`}
                    onClick={() => handleCardClick(Number(cardId))}
                  >
                    Card {cardId.toString()}
                  </CardBoxGame>
                ))}
              </div>
              {/*You will have to be connected to be able to see the buttons to do stuff*/}
              <div className="theAttackButtons">
                <div className="buttons">
                  <BoxButton
                    disabled={isLoadingATX}
                    outsidePadding="20px"
                    borderRadius="100%"
                    height="80px"
                    width="80px"
                    onClick={async () => {
                      console.log('use button check if disabled')
                      useNormalAttack(selectedCard)
                    }}
                  >
                    <GiCrossedSwords size={43} />
                  </BoxButton>
                  <BoxButton
                    disabled={isLoadingATX}
                    borderRadius="100%"
                    height="68px"
                    width="68px"
                    onClick={() => {
                      console.log('use button check if disabled')
                      useULT2Attack(selectedCard)
                    }}
                  >
                    <GiSwordWound size={40} />
                  </BoxButton>
                  <BoxButton
                    disabled={isLoadingATX}
                    outsidePadding="20px"
                    borderRadius="100%"
                    height="60px"
                    width="60px"
                    onClick={() => {
                      console.log('use button check if disabled')
                      useULT3Attack(selectedCard)
                    }}
                  >
                    <GiPointySword size={40} />
                  </BoxButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <EmptyView>
            <span>No Game Found</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <BoxButton>Home</BoxButton>
            </div>
          </EmptyView>
        </div>
      )}
    </div>
  )
}
