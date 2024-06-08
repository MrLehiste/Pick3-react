import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../util/http.js';
import Tabs from './Tabs.jsx';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { DATE_OPT_MDY4, DATE_OPT_DAY_LONG, DATE_OPT_MONTH_LONG, Q_MAP, classNames } from './UI/constants';
import { Field, Label, Switch } from '@headlessui/react'

const MONTH_0 = new Date(new Date().setMonth(new Date().getMonth() - 1));
const DAY_1 = new Date();
const DAY_2 = new Date(new Date().setDate(new Date().getDate() + 1));
const MONTH_1 = new Date();
const MONTH_2 = new Date(new Date().setMonth(new Date().getMonth() + 1));
const PICKS_TABS = [
  MONTH_0.toLocaleDateString('en-US', DATE_OPT_MONTH_LONG)+"' Picks"
  , "Today's Picks"
  , "Tomorrow's Picks"
  , MONTH_1.toLocaleDateString('en-US', DATE_OPT_MONTH_LONG)+"' Picks"
  , MONTH_2.toLocaleDateString('en-US', DATE_OPT_MONTH_LONG)+"' Picks"];
const STR_MY_TAB = "My Tab";
const STR_PICKS_TAB = "picks-tab";
const STR_2_PICKS = "2. Picks";
const STR_PICKS_DTFROM = "picks-dtfrom";
const STR_PICKS_DTTO = "picks-dtto";

export default function ContentPicks({ state, onPageChange }) {
  const [tab, setTab] = useState(PICKS_TABS[0]);
  const handleTabChange = (value) => { 
    setTab(value); 
    console.log("TAB", value);
    localStorage.setItem(STR_PICKS_TAB, value); 
    onPageChange(STR_2_PICKS); 
    initDates(value);
  };
  const initDates = (value) => {
    switch(value){
      case PICKS_TABS[0]:
        MONTH_0.setDate(1);
        setDtFrom(MONTH_0.toLocaleDateString('en-US', DATE_OPT_MDY4));
        MONTH_0.setMonth(MONTH_0.getMonth() + 1);
        MONTH_0.setDate(0);
        setDtTo(MONTH_0.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[1]:
        setDtFrom(DAY_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        setDtTo(DAY_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[2]:
        setDtFrom(DAY_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        setDtTo(DAY_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[3]:
        //MONTH_1.setDate(1);
        //setDtFrom(MONTH_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        setDtFrom(DAY_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        MONTH_1.setMonth(MONTH_1.getMonth() + 1);
        MONTH_1.setDate(0);
        setDtTo(MONTH_1.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
      case PICKS_TABS[4]:
        MONTH_2.setDate(1);
        setDtFrom(MONTH_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        MONTH_2.setMonth(MONTH_2.getMonth() + 1);
        MONTH_2.setDate(0);
        setDtTo(MONTH_2.toLocaleDateString('en-US', DATE_OPT_MDY4));
        break;
    }
  }
  useEffect(() => {
    const storedTab = localStorage.getItem(STR_PICKS_TAB);
    if (storedTab && storedTab !== tab) { 
      setTab(storedTab); 
      onPageChange(STR_2_PICKS); 
      if(storedTab==STR_MY_TAB){
        const storedDtFrom = localStorage.getItem(STR_PICKS_DTFROM);
        if(storedDtFrom) setDtFrom(storedDtFrom);
        const storedDtTo = localStorage.getItem(STR_PICKS_DTTO);
        if(storedDtTo) setDtTo(storedDtTo);
      } 
      else { initDates(storedTab); } 
      
    }
    return () => {};
  }, []);

  const [dtFrom, setDtFrom] = useState(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
  const handleFromChange = (date) => { 
    const dtfrom = new Date(date).toLocaleDateString('en-US', DATE_OPT_MDY4); 
    setDtFrom(dtfrom);
    localStorage.setItem(STR_PICKS_DTFROM, dtfrom); 
    setTab(STR_MY_TAB);
    localStorage.setItem(STR_PICKS_TAB, STR_MY_TAB);
  };
  const [dtTo, setDtTo] = useState(new Date().toLocaleDateString('en-US', DATE_OPT_MDY4));
  const handleToChange = (date) => { 
    const dtto = new Date(date).toLocaleDateString('en-US', DATE_OPT_MDY4); 
    setDtTo(dtto); 
    localStorage.setItem(STR_PICKS_DTTO, dtto); 
    setTab(STR_MY_TAB);
    localStorage.setItem(STR_PICKS_TAB, STR_MY_TAB);
  };
  const [allToggle, setAllToggle] = useState(false);
  const handleAllToggle = () => { setAllToggle(prevAllToggle => !prevAllToggle); };

  const picksUrl = import.meta.env.VITE_URL_PICKS + '&state='+state+'&dt1='+dtFrom+'&dt2='+dtTo;
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'picks', dtFrom, dtTo],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: picksUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });
  const [highlightedRow, setHighlightedRow] = useState(null);
  const handleRowClick = (index) => {
    setHighlightedRow(index === highlightedRow ? null : index); // Toggle highlighting
  };

  let resultsTable;
  if (isPending) { resultsTable = <LoadingIndicator />; }
  if (isError) {
    resultsTable = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch scramble data.'} />
    );
  }
  if (data) {
    const pdata = data.filter(d => !allToggle || d.Magic || d.Sq3 );
    resultsTable = (<table className="min-w-full divide-y divide-gray-300">
    <thead className="sticky top-0 z-10 bg-gray-50 text-lg">
      <tr>
        <th scope="col" colSpan={2} className="rounded-tl-lg py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
          <span className="flex items-center">
            <span className="bg-gray-900 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
              {pdata.length}
            </span> 
            <span className='ml-1'>Picks</span>
          </span>
        </th>
        <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
          Date
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left font-semibold text-gray-900">
          Permutation
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left font-semibold text-gray-900">
          Entry
        </th>
        <th scope="col" colSpan={2} className="px-3 py-3.5 text-left font-semibold text-gray-900">
          Hit
        </th>
        <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
          Pick
        </th>
        <th scope="col" className="rounded-tr-lg px-3 py-3.5 text-left font-semibold text-gray-900">
          Calendar
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-900 bg-white text-lg">
      {pdata.map((d, index) => (
        <tr key={"picks-tr-"+index+d.Num+d.Dt} className={`cursor-pointer ${highlightedRow === index ? 'bg-yellow-200' : ''}`}
        onClick={() => handleRowClick(index)}>
          <td className={classNames( (index==data.length-1) ? "rounded-bl-lg " : "", "py-3 whitespace-nowrap pl-4 pr-1 font-medium text-gray-900 sm:pl-6")}>
            {d.Num} 
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_DAY_LONG)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            {new Date(d.Dt).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">{d.Permutation}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            {new Date(d.Pdtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">{d.Entry}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            {d.Entry && new Date(d.Edtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">{d.Hitnum}</td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            {d.Hitnum && <span className='pick-box p-1'>
              {new Date(d.Hitdtm).toLocaleDateString('en-US', DATE_OPT_MDY4)}</span>}
            {d.Q ? <span className={classNames( Q_MAP.filter(q => q.q1 == d.Q11)[0].bg , "w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md")}>
              {d.Q}
            </span> : <span className='m-3 font-bold'>S</span>}
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-gray-500">
            <span className={classNames(d.Magic ? "magic-box pr-1 pl-1" : d.Sq3 ? "trident-box pr-1 pl-1" : "", "text-black font-bold")}>
             {d.Q} {d.Num} {d.Squiggly}
            </span>
          </td>
          <td className={classNames( (index==data.length-1) ? "rounded-br-lg " : "", "whitespace-nowrap px-3 py-1 text-gray-500")}>
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
                    <tr>
                      <th>
                      <div className='grid place-items-center'>
                      <Field as="div" className="flex items-center">
                        <Label as="span" className="m-3 text-sm cursor-pointer" onClick={handleAllToggle}>
                          <span className="font-medium text-gray-900">ALL</span>{' '}
                          <span className="text-gray-500">PICKS</span>
                        </Label>
                        <Switch
                          checked={allToggle}
                          onChange={handleAllToggle}
                          className={classNames(
                            allToggle ? 'bg-indigo-600' : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ring-2 ring-indigo-600 ring-offset-2'
                          )}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            className={classNames(
                              allToggle ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                            )}
                          >
                            <span
                              className={classNames(
                                allToggle ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                                'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                              )}
                              aria-hidden="true"
                            >
                              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              className={classNames(
                                allToggle ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                                'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                              )}
                              aria-hidden="true"
                            >
                              <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                        <Label as="span" className="ml-3 text-sm cursor-pointer" onClick={handleAllToggle}>
                          <span className="font-medium text-gray-900">Magic</span>{' '}
                          <span className="text-gray-500">Trident €</span>
                        </Label>
                      </Field>
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
