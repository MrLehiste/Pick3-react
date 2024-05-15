import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../util/http.js';
import Tabs from './Tabs.jsx';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { DATE_OPT_MDY4, DATE_OPT_DAY_LONG, DATE_OPT_MONTH_LONG, classNames } from './UI/constants';

const MONTH_1 = new Date(new Date().setMonth(new Date().getMonth() - 1));
const MONTH_2 = new Date(new Date().setMonth(new Date().getMonth() - 2));
const PICKS_TABS = ["Today's Picks"
  , MONTH_1.toLocaleDateString('en-US', DATE_OPT_MONTH_LONG)+' Picks'
  , MONTH_2.toLocaleDateString('en-US', DATE_OPT_MONTH_LONG)+' Picks'];

export default function ContentPicks({ state, onPageChange }) {
  const [tab, setTab] = useState(PICKS_TABS[0]);
  const handleTabChange = (value) => { 
    setTab(value); 
    localStorage.setItem('picks-tab', value); 
    onPageChange("Picks " + (PICKS_TABS.indexOf(value)+1) ); 
    initDates(value);
  };
  const initDates = (value) => {
    switch(value){
      case PICKS_TABS[0]:
        setDtFrom(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
        setDtTo(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[1]:
        MONTH_1.setDate(1);
        setDtFrom(MONTH_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        MONTH_1.setMonth(MONTH_1.getMonth() + 1);
        MONTH_1.setDate(0);
        setDtTo(MONTH_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[2]:
        MONTH_2.setDate(1);
        setDtFrom(MONTH_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        MONTH_2.setMonth(MONTH_2.getMonth() + 1);
        MONTH_2.setDate(0);
        setDtTo(MONTH_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
    }
  }
  useEffect(() => {
    const storedTab = localStorage.getItem('picks-tab');
    if (storedTab && storedTab !== tab) { 
      setTab(storedTab); 
      onPageChange("Picks " + (PICKS_TABS.indexOf(storedTab)+1) ); 
      initDates(storedTab);
    }
    return () => {};
  }, []);

  const [dtFrom, setDtFrom] = useState(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
  const handleFromChange = (date) => { setDtFrom(new Date(date).toLocaleDateString('en-US', DATE_OPT_MDY4)); };
  const [dtTo, setDtTo] = useState(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
  const handleToChange = (date) => { setDtTo(new Date(date).toLocaleDateString('en-US', DATE_OPT_MDY4)); };

  const picksUrl = import.meta.env.VITE_URL_PICKS + '&state='+state+'&dt1='+dtFrom+'&dt2='+dtTo;
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'picks', dtFrom, dtTo],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: picksUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let resultsTable;
  if (isPending) { resultsTable = <LoadingIndicator />; }
  if (isError) {
    resultsTable = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch scramble data.'} />
    );
  }
  if (data) {
    resultsTable = (<table className="min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" colSpan={2} className="rounded-tl-lg py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
          <span className="flex items-center">
            <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
              {data.length}
            </span> 
            <span className='ml-1'>Picks</span>
          </span>
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Date
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Permutation
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Entry
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Hit
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Pick
        </th>
        <th scope="col" className="rounded-tr-lg px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          Calendar
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {data.map((d, index) => (
        <tr key={"picks-tr-"+index}>
          <td className={classNames( (index==data.length-1) ? "rounded-bl-lg " : "", "whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6")}>
            {d.Num} 
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_DAY_LONG)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{d.Permutation}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Pdtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{d.Entry}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {d.Entry && new Date(d.Edtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">{d.Hitnum}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {d.Hitnum && <span className='pick-box p-1'>
              {new Date(d.Hitdtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</span>}</td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            <span className={d.Magic ? "magic-box pr-1 pl-1" : d.Sq3 ? "trident-box pr-1 pl-1" : ""}>
              {d.Q} {d.Num} {d.Squiggly}
            </span>
          </td>
          <td className={classNames( (index==data.length-1) ? "rounded-br-lg " : "", "whitespace-nowrap px-3 py-1 text-sm text-gray-500")}>
            <a href={d.Calendar} target='_blank'>Add to Calendar</a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>);
  }

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
                          <Tabs onTabChange={handleTabChange} selectedTab={tab} tabList={PICKS_TABS} />
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <th>
                        <div className='p-4 nowrap'>
                          From: <DatePicker className='w-28 mr-2' selected={dtFrom} onChange={handleFromChange} />
                          To: <DatePicker className='w-28 mr-2' selected={dtTo} onChange={handleToChange} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div>{resultsTable}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
