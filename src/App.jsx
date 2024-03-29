import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import MagicNumberBox from './components/MagicNumberBox.jsx';
import StateSelect from './components/StateSelect.jsx';
import Tabs from './components/Tabs.jsx';
import ContentMagic from './components/ContentMagic.jsx';
import ContentTablet from './components/ContentTablet.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import ContentScramble from './components/ContentScramble.jsx';
import ContentPicks from './components/ContentPicks.jsx';
import ContentX from './components/ContentX.jsx';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient();
const DEFAULT_TAB = "Sheet";

export default function App() {
  const [state, setState] = useState('fl');
  const handleStateChange = (value) => { setState(value); setTab(DEFAULT_TAB); console.log('State changed', value); };
  const handleDataLoaded = () => { setTab(DEFAULT_TAB); console.log('Data Loaded', state); };
  const handleDataUpdated = () => { queryClient.invalidateQueries({ queryKey: [state] }); setTab(DEFAULT_TAB); console.log('Data Updated', state); };
  
  const [num, setNum] = useState(0);
  useEffect(() => {
    const storedValue = localStorage.getItem('magic-number');
    if (storedValue) { setNum(storedValue); }
    return () => {};
  }, []);
  const handleNumChange = (value) => { setNum(value); console.log('Num changed', value); };
  const handleNumClick = (value) => { setNum(value); setTab('Tablet'); console.log('Num clicked', value); };
  
  const [tab, setTab] = useState();
  const handleTabChange = (value) => { setTab(value); console.log('Tab changed', value); };

  const [panelMonth, setPanelMonth] = useState(new Date().getMonth() + 1);
  const handlePanelMonthChange = (value) => { setPanelMonth(value); console.log('Month changed', value); };
  const handleMonthClick = (value) => { setPanelMonth(value); setTab('Panel'); console.log('Month clicked', value); };
  return (
    <>
      <Header />
      <QueryClientProvider client={queryClient}>
        <StateSelect onStateChange={handleStateChange} onDataLoaded={handleDataLoaded} onDataUpdated={handleDataUpdated} />
        <main className="flex flex-col items-center">
          <MagicNumberBox onNumberChange={handleNumChange} num={num} />
          <Tabs onTabChange={handleTabChange} selectedTab={tab} />
          { tab==='Sheet' && <ContentX state={state} num={num} onMonthClick={handleMonthClick} /> }
          { tab==='Magic' && <ContentMagic onNumberClick={handleNumClick} state={state} num={num} /> }
          { tab==='Tablet' && <ContentTablet state={state} num={num} /> }
          { tab==='Panel' && <ContentPanel state={state} num={num} panelMonth={panelMonth} onMonthChange={handlePanelMonthChange} /> }
          { tab==='Scramble' && <ContentScramble state={state} num={num} /> }
          { tab==='Picks' && <ContentPicks state={state} num={num} /> }
        </main>
      </QueryClientProvider>
    </>
  );
}
