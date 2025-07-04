import '@reach/dialog/styles.css'
import { Provider as AtomProvider } from 'jotai'
import { ReactNode, StrictMode } from 'react'
import './sentry'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { Web3Provider } from '@cowprotocol/wallet'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemeProvider } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useAppSelector } from 'legacy/state/hooks'

import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { APP_HEADER_ELEMENT_ID } from '../common/constants/common'
import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CA } from '@arcana/ca-sdk'
import { CAProvider } from 'modules/ca-ui/src'
import { tradeData } from 'modules/trade'
import { getStepData } from 'modules/tradeFlow/services/swapFlow'

const cowAnalytics = initGtm()
const helmetContext = {}


export function getSupplyVal() {
  const data = tradeData();
  return data;
}

export function getManualStepsStatus() {
  return getStepData();
}
// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}
const ca = new CA()
const queryClient = new QueryClient()
console.log('CowSwap frontend initialized', { ca, queryClient })

function Main(): ReactNode {
  return (
    <StrictMode>
      <SvgCacheProvider>
        <HelmetProvider context={helmetContext}>
          <Provider store={cowSwapStore}>
            <AtomProvider store={jotaiStore}>
              <ThemeProvider>
                <HashRouter>
                  <LanguageProvider>
                    <WagmiProvider config={config}>
                      <QueryClientProvider client={queryClient}>
                        <CAProvider client={ca}>
                          <Web3ProviderInstance>
                            <BlockNumberProvider>
                              <WithLDProvider>
                                <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                                  <WalletUnsupportedNetworkBanner />
                                  <Updaters />
                                  <Toasts />
                                  <App />
                                </CowAnalyticsProvider>
                              </WithLDProvider>
                            </BlockNumberProvider>
                          </Web3ProviderInstance>
                        </CAProvider>
                      </QueryClientProvider>
                    </WagmiProvider>
                  </LanguageProvider>
                </HashRouter>
              </ThemeProvider>
            </AtomProvider>
          </Provider>
        </HelmetProvider>
      </SvgCacheProvider>
    </StrictMode>
  )
}

function Web3ProviderInstance({ children }: { children: ReactNode }): ReactNode {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)
  const { standaloneMode } = useInjectedWidgetParams()

  return (
    <Web3Provider standaloneMode={standaloneMode} selectedWallet={selectedWallet}>
      {children}
    </Web3Provider>
  )
}

function Toasts(): ReactNode {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<Main />)
} else {
  console.error('Failed to find the root element')
}

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
