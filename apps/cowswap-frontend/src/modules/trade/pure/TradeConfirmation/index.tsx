import { ReactElement, useEffect, useRef, useState } from 'react'

import { BackButton, BannerOrientation, ButtonPrimary, ButtonSize, CenteredDots, LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import type { AppDataInfo } from 'modules/appData'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyInputPanel'
import { CustomRecipientWarningBanner } from 'common/pure/CustomRecipientWarningBanner'

import { QuoteCountdown } from './CountDown'
import { useIsPriceChanged } from './hooks/useIsPriceChanged'
import * as styledEl from './styled'

import { NoImpactWarning } from '../../containers/NoImpactWarning'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { PriceUpdatedBanner } from '../PriceUpdatedBanner'
import Decimal from 'decimal.js';
import { useCAFn, useUnifiedBalance } from 'modules/ca-ui/src';

export interface TradeConfirmationProps {
  onConfirm(): Promise<void | false>

  onDismiss(): void

  account: string | undefined
  ensName: string | undefined
  appData?: string | AppDataInfo
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isConfirmDisabled: boolean
  priceImpact: PriceImpact
  title: ReactElement | string
  refreshInterval?: number
  isPriceStatic?: boolean
  recipient?: string | null
  buttonText?: React.ReactNode
  children?: (restContent: ReactElement) => ReactElement
}

let supplyVal = Decimal('0');
export const tradeData = () => {
  return supplyVal ;
};

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function TradeConfirmation(props: TradeConfirmationProps) {
  const { pendingTrade, forcePriceConfirmation } = useTradeConfirmState()

  const propsRef = useRef(props)
  propsRef.current = props

  const [frozenProps, setFrozenProps] = useState<TradeConfirmationProps | null>(null)
  const hasPendingTrade = !!pendingTrade

  const {
    onConfirm,
    onDismiss,
    account,
    ensName,
    inputCurrencyInfo,
    outputCurrencyInfo,
    isConfirmDisabled,
    priceImpact,
    title,
    refreshInterval,
    buttonText = 'Confirm',
    children,
    recipient,
    isPriceStatic,
    appData,
  } = frozenProps || props

  const [isConfirmClicked, setIsConfirmClicked] = useState(false)

  /**
   * Once user sends a transaction, we keep the confirmation content frozen
   */
  useEffect(() => {
    setFrozenProps(hasPendingTrade ? propsRef.current : null)

    if (!hasPendingTrade) {
      setIsConfirmClicked(false)
    }
  }, [hasPendingTrade])

  const showRecipientWarning =
    recipient &&
    (account || ensName) &&
    ![account?.toLowerCase(), ensName?.toLowerCase()].includes(recipient.toLowerCase())
    const { bridge } = useCAFn();
    const caBalances = useUnifiedBalance().balances;
    const caBigInt = useUnifiedBalance().balance;


  const inputAmount = inputCurrencyInfo.amount?.toExact()
  const outputAmount = outputCurrencyInfo.amount?.toExact()

  const { isPriceChanged, resetPriceChanged } = useIsPriceChanged(inputAmount, outputAmount, forcePriceConfirmation)

  const isButtonDisabled =
    (isPriceChanged && !isPriceStatic) || hasPendingTrade || isConfirmClicked

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const isUpToMedium = useMediaQuery(upToMedium)

  // Combine local onClick logic with incoming onClick
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleConfirmClick = async () => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    setIsConfirmClicked(true)
    console.log(inputCurrencyInfo.amount)
    console.log(caBalances
            ?.find((balance) => balance.symbol === inputCurrencyInfo?.amount?.currency?.symbol)?.balance!)

    if( inputCurrencyInfo?.amount?.toExact()! > inputCurrencyInfo?.balance?.toExact()! 
      )
        
   { 
    console.log('CA bridge functionality triggered');
    console.log(new Decimal(inputCurrencyInfo?.amount?.toExact()!));
    const decimalAmount = new Decimal(inputCurrencyInfo?.amount?.toExact()!).sub(
              caBalances
                ?.find((balance) => balance.symbol === inputCurrencyInfo?.amount?.currency?.symbol)
                ?.breakdown.find((breakdown) => breakdown.chain.id === inputCurrencyInfo?.amount?.currency?.chainId)
                ?.balance!
            )
            .add( inputCurrencyInfo?.amount?.currency?.symbol != 'WETH' ? '0' : '0.000001')
            .toString();
            // add CA bridge functionality here
    supplyVal = new Decimal(decimalAmount);
    await bridge({
            amount: decimalAmount,
            token: ['USDC', 'USDT', 'ETH', 'usdc', 'usdt', 'eth'].find(
              (token) => token === inputCurrencyInfo?.amount?.currency?.symbol?.toLowerCase()
            ) as 'USDC' | 'USDT' | 'ETH' | 'usdc' | 'usdt' | 'eth',
            chain: inputCurrencyInfo?.amount?.currency?.chainId!,
          });}
        


    const isConfirmed = await onConfirm()

    if (!isConfirmed) {
      setIsConfirmClicked(false)
    }
  }

  const hookDetailsElement = (
    <>
      {appData && (
        <OrderHooksDetails appData={appData} isTradeConfirmation>
          {(hookChildren) => hookChildren}
        </OrderHooksDetails>
      )}
    </>
  )

  return (
    <styledEl.WidgetWrapper onKeyDown={(e) => e.key === 'Escape' && onDismiss()}>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <styledEl.ConfirmHeaderTitle>{title}</styledEl.ConfirmHeaderTitle>

        <styledEl.HeaderRightContent>
          {hasPendingTrade ? null : <QuoteCountdown refreshInterval={refreshInterval} />}
        </styledEl.HeaderRightContent>
      </styledEl.Header>
      <styledEl.ContentWrapper id="trade-confirmation">
        <styledEl.AmountsPreviewContainer>
          <CurrencyAmountPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} />
          <styledEl.SeparatorWrapper>
            <styledEl.AmountsSeparator />
          </styledEl.SeparatorWrapper>
          <CurrencyAmountPreview
            id="output-currency-preview"
            currencyInfo={outputCurrencyInfo}
            priceImpactParams={priceImpact}
          />
        </styledEl.AmountsPreviewContainer>
        {children?.(
          <>
            {hookDetailsElement}
            <NoImpactWarning withoutAccepting />
          </>,
        )}

        {showRecipientWarning && <CustomRecipientWarningBanner orientation={BannerOrientation.Horizontal} />}
        {isPriceChanged && !isPriceStatic && <PriceUpdatedBanner onClick={resetPriceChanged} />}
        <ButtonPrimary onClick={handleConfirmClick} disabled={isButtonDisabled} buttonSize={ButtonSize.BIG}>
          {hasPendingTrade || isConfirmClicked ? (
            <LongLoadText fontSize={15} fontWeight={500}>
              Confirm with your wallet <CenteredDots smaller />
            </LongLoadText>
          ) : (
            <Trans>Confirm Swap</Trans>
          )}
        </ButtonPrimary>
      </styledEl.ContentWrapper>
    </styledEl.WidgetWrapper>
  )
}
