import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import '../App.css';
import config from '../config.json';

import { loadNetwork, loadProvider,loadAccount, loadTokens, loadExchange } from '../store/interactions';
import Navbar from './Navbar';
import Markets from './Markets';
import Transactions from './Transactions';
import Trades from './Trades';
import Order from './Order';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Balance from './Balance';
import Alert from './Alert';

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    await loadAccount(dispatch,provider)

    const provider=loadProvider(dispatch)
    
    const chainId = await loadNetwork(provider, dispatch);

     window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    await loadAccount(dispatch,provider)  
    

    await loadTokens(provider, [config[chainId].DApp.address, config[chainId].mETH.address], dispatch)
    
    await loadExchange(provider, config[chainId].exchange, dispatch);

  }

  useEffect(() => {
    loadBlockchainData();
  })


  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

        <Markets />

        <Balance />

        <Order />

        </section>
        <section className='exchange__section--right grid'>

        <PriceChart />

        <Transactions />

        <Trades />

        <OrderBook />

        </section>
        </main>

        <Alert />

    </div>
  ); 
}

export default App;
