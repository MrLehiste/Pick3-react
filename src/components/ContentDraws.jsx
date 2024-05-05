import { useState, useEffect } from 'react';
import Tabs from './Tabs.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import DrawsTablet from './DrawsTablet.jsx';
import DrawsScramble from './DrawsScramble.jsx';
import DrawsHistory from './DrawsHistory.jsx';

const DRAWS_TABS = ['History', 'Tablet', 'Scramble'];

export default function ContentDraws({ state, onPageChange }) {
  const [tab, setTab] = useState(DRAWS_TABS[0]);
  const [pnum, setPnum] = useState(0);
  const handleTabChange = (value) => { 
    setTab(value); 
    localStorage.setItem('draws-tab', value); 
    onPageChange("Panels " + (DRAWS_TABS.indexOf(value)+1) ); 
  };
  useEffect(() => {
    const storedTab = localStorage.getItem('draws-tab');
    if (storedTab) { setTab(storedTab); onPageChange("Draws " + (DRAWS_TABS.indexOf(storedTab)+1) ); }
    const storedPnum = localStorage.getItem('draws-number');
    if (storedPnum) { setPnum(storedPnum); }
    return () => {};
  }, []);

  const [dtFrom, setDtFrom] = useState(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
  const handleFromChange = (date) => { setDtFrom(date); };
  const [dtTo, setDtTo] = useState(new Date());
  const handleToChange = (date) => { setDtTo(date); };

  function handlePnumChange(value) {
    localStorage.setItem('draws-number', value);
    setPnum(value);
  }
  const numberBox = (
    <div className="mb-2 mt-2 flex flex-wrap gap-2 w-fit max-w-sm p-4 mx-auto rounded shadow-md bg-gradient-to-b from-stone-500 to-stone-800">
      <div className="mt-2">
        <span className="px-4 py-2 font-semibold uppercase rounded text-stone-900 bg-amber-400 hover:bg-amber-500">
          Draw
        </span>
      </div>
      <div className="w-20">
        <input className='w-full px-3 py-2 leading-tight border rounded shadow text-gray-700 bg-stone-100' 
          type="number" min="0" max="999" step="1" value={pnum} 
          onChange={(event) => handlePnumChange(event.target.value)} />
      </div>
    </div>
  );

  const drawsContent = () => {
    switch (tab) {
      case DRAWS_TABS[0]:
        return <DrawsHistory state={state} dtFrom={dtFrom} dtTo={dtTo} />;
      case DRAWS_TABS[1]:
        return <DrawsTablet state={state} num={pnum} />;
      case DRAWS_TABS[2]:
        return <DrawsScramble state={state} num={pnum} />;
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
                          <Tabs onTabChange={handleTabChange} selectedTab={tab} tabList={DRAWS_TABS} />
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <th>
                        { tab!==DRAWS_TABS[0] && numberBox }
                        { tab==DRAWS_TABS[0] && <div className='p-4 nowrap'>
                          From: <DatePicker className='w-28 mr-2' selected={dtFrom} onChange={handleFromChange} />
                          To: <DatePicker className='w-28 mr-2' selected={dtTo} onChange={handleToChange} />
                        </div>}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div>{drawsContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
