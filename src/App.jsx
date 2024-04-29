import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import PageNumberBox from './components/PageNumberBox.jsx';
import MagicNumberBox from './components/MagicNumberBox.jsx';
import StateSelect from './components/StateSelect.jsx';
import Tabs from './components/Tabs.jsx';
import ContentMagic from './components/ContentMagic.jsx';
import ContentTablet from './components/ContentTablet.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import ContentScramble from './components/ContentScramble.jsx';
import ContentPicks from './components/ContentPicks.jsx';
import ContentSheet from './components/ContentSheet.jsx';
import ContentScoreboard from './components/ContentScoreboard.jsx';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient();
const DEFAULT_TABS = ['Sheet', 'Magic', 'Tablet', 'Panel', 'Scramble', 'Picks', 'Scoreboard']
const DEFAULT_TAB = "Scoreboard";
const DEFAULT_STATE = "";

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [dataAvailable, setDataAvailable] = useState(false);
  const handleStateChange = (value) => { setState(value); localStorage.setItem('state', value); console.log('State changed', value); };
  const handleDataLoaded = () => { setDataAvailable(true); console.log('Data Loaded', state); };
  const handleDataUpdated = () => { queryClient.invalidateQueries({ queryKey: [state] }); console.log('Data Updated', state); };
  
  const [num, setNum] = useState(0);
  const [page, setPage] = useState("Page 0");
  useEffect(() => {
    const storedState = localStorage.getItem('state');
    if (storedState) { setState(storedState); }
    const storedValue = localStorage.getItem('magic-number');
    if (storedValue) { setNum(storedValue); }
    const storedTab = localStorage.getItem('tab');
    if (storedTab) { setTab(storedTab); }
    const storedPage = localStorage.getItem('page-number');
    if (storedPage) { setPage(storedPage); }
    return () => {};
  }, []);
  const handleNumChange = (value) => { setNum(value); console.log('Num changed', value); };
  const handleNumClick = (value) => { setNum(value); setTab('Tablet'); localStorage.setItem('tab', 'Tablet'); console.log('Num clicked', value); };
  const handlePageChange = (value) => { setPage(value); localStorage.setItem('page-number', value); console.log('Page changed', value); };

  const [tab, setTab] = useState(DEFAULT_TAB);
  const handleTabChange = (value) => { setTab(value); localStorage.setItem('tab', value); setPage(value); localStorage.setItem('page-number', value); console.log('Tab changed', value); };

  const [panelMonth, setPanelMonth] = useState(new Date().getMonth() + 1);
  const handlePanelMonthChange = (value) => { setPanelMonth(value); console.log('Month changed', value); };
  const handleMonthClick = (value) => { setPanelMonth(value); setTab('Panel'); localStorage.setItem('tab', 'Panel'); console.log('Month clicked', value); };
  return (
    <>
      <Header />
      <QueryClientProvider client={queryClient}>
        <PageNumberBox page={page} />
        <StateSelect selectedState={state} onStateChange={handleStateChange} onDataLoaded={handleDataLoaded} onDataUpdated={handleDataUpdated} />
        {dataAvailable &&
          <main className="flex flex-col items-center">
            <MagicNumberBox onNumberChange={handleNumChange} num={num} />
            <Tabs onTabChange={handleTabChange} selectedTab={tab} tabList={DEFAULT_TABS} />
            { tab==='Sheet' && <ContentSheet state={state} num={num} onMonthClick={handleMonthClick} /> }
            { tab==='Magic' && <ContentMagic onNumberClick={handleNumClick} state={state} num={num} /> }
            { tab==='Tablet' && <ContentTablet state={state} num={num} /> }
            { tab==='Panel' && <ContentPanel state={state} num={num} panelMonth={panelMonth} onMonthChange={handlePanelMonthChange} /> }
            { tab==='Scramble' && <ContentScramble state={state} num={num} /> }
            { tab==='Picks' && <ContentPicks state={state} num={num} /> }
            { tab==='Scoreboard' && <ContentScoreboard onPageChange={handlePageChange} state={state} /> }
          </main>
        }
      </QueryClientProvider>
    </>
  );
}
