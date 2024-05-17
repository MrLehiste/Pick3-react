import { useState, useEffect } from 'react';
import Tabs from './Tabs.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import PanelSheet from './PanelSheet.jsx';
import PanelDotPlot from './PanelDotPlot.jsx';
import PanelMagic from './PanelMagic.jsx';
import PanelOpen from './PanelOpen.jsx';

const PANELS_TABS = ['Open', 'Dot Plot', 'Sheet', 'Magic'];

export default function ContentPanels({ state, onPageChange }) {
  const [ptab, setPtab] = useState(PANELS_TABS[0]);
  const handleTabChange = (value) => { 
    setPtab(value); 
    localStorage.setItem('panels-tab', value); 
    onPageChange("3. Panels" ); 
  };
  const [pnum, setPnum] = useState(0);
  useEffect(() => {
    const storedTab = localStorage.getItem('panels-tab');
    if (storedTab) { setPtab(storedTab); onPageChange("3. Panels"); }
    const storedPnum = localStorage.getItem('panels-number');
    if (storedPnum) { setPnum(storedPnum); }
    return () => {};
  }, []);

  function handlePnumClick(value) {
    localStorage.setItem('panels-number', value);
    setPnum(value);
    localStorage.setItem('panels-tab', PANELS_TABS[1]);
    setPtab(PANELS_TABS[1]);
  }
  const [dtPanel, setDtPanel] = useState(new Date());
  const handleDtPanelChange = (date) => { setDtPanel(date); };

  const numberBox = (
    <div className="mb-2 mt-2 flex flex-wrap gap-2 w-fit max-w-sm p-4 mx-auto rounded shadow-md bg-gradient-to-b from-stone-500 to-stone-800">
      <div className="mt-2">
        <span className="px-4 py-2 font-semibold uppercase rounded text-stone-900 bg-amber-400 hover:bg-amber-500">
          Panel
        </span>
      </div>
      <div className="w-20">
        <input className='w-full px-3 py-2 leading-tight border rounded shadow text-gray-700 bg-stone-100' 
          type="number" min="0" max="999" step="10" value={pnum} 
          onChange={(event) => handlePnumChange(event.target.value)} />
      </div>
    </div>
  );

  const handleMonthClick = (value) => { 
    //setPanelMonth(value); 
    //setTab('Panel'); 
    //localStorage.setItem('panels-tab', 'Panel'); 
    console.log('Panel Month clicked', value); 
  };
  
  const panelContent = () => {
    switch (ptab) {
      case PANELS_TABS[0]:
        return <PanelOpen state={state} dt={dtPanel} onPanelClick={handlePnumClick} />;
      case PANELS_TABS[1]:
        return <PanelDotPlot state={state} num={pnum} />;
      case PANELS_TABS[2]:
        return <PanelSheet state={state} num={pnum} onMonthClick={handleMonthClick} />;
      case PANELS_TABS[3]:
        return <PanelMagic state={state} num={pnum} />;
      default:
        return <div>Panel Not Found</div>;
    }
  };

  return (
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="mt-0 flow-root">
      <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle grid">
          <div className="flex">
            <div className="grid grid-cols-1 justify-items-center">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <table className="divide-y divide-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="pt-2">
                        <div className="flex justify-center items-center">
                          <Tabs onTabChange={handleTabChange} selectedTab={ptab} tabList={PANELS_TABS} />
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <th>
                        { ptab!==PANELS_TABS[0] && numberBox }
                        { ptab==PANELS_TABS[0] && <div className='p-5'>
                        As of: <DatePicker className='w-28' selected={dtPanel} onChange={handleDtPanelChange} />
                        </div> }
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div>{panelContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
