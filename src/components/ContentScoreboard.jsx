import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Tabs from './Tabs.jsx';
import { HEADER_MONTHS, Q_MAP, MAGIC_INTERVAL } from './UI/constants';

const INIT_FROM = new Date(2019, 0, 1);
const INIT_TO = new Date();
const INIT_YEARS = [];
//const bgColors = ['bg-pink-300','bg-green-400','bg-amber-600','bg-red-500','bg-blue-600','bg-yellow-300'];

export default function ContentScoreboard({ state, onPageChange }) {
  const dateOptions = { month: 'numeric', day: 'numeric' };
  const dateOptions2 = { month: 'numeric', day: 'numeric', year: 'numeric' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const SCORE_TABS = ['Horizontal ==', 'Vertical ||', 'Days Dot Plot', 'Years Dot Plot', 'Magic Interval'];
  const [tab, setTab] = useState(SCORE_TABS[0]);
  const handleTabChange = (value) => { setTab(value); localStorage.setItem('score-tab', value); onPageChange("Scoreboard " + (SCORE_TABS.indexOf(value)+1) ); };
  const [dtFrom, setDtFrom] = useState(INIT_FROM);
  const handleFromChange = (date) => { setDtFrom(date); localStorage.setItem('score-from', date); };
  useEffect(() => {
    const storedTab = localStorage.getItem('score-tab');
    if (storedTab) { setTab(storedTab); onPageChange("Scoreboard " + (SCORE_TABS.indexOf(storedTab)+1) ); }
    const storedDtFrom = localStorage.getItem('score-from');
    if (storedDtFrom) { setDtFrom(new Date(storedDtFrom)); }
    const storedQs = localStorage.getItem('score-qs');
    if (storedQs) { setEnabledQs(storedQs.split(',').map(str => str.trim() === "true")); }
    //console.log('storedQs', storedQs);
    return () => {};
  }, []);
  const [dtTo, setDtTo] = useState(INIT_TO);
  const handleToChange = (date) => { setDtTo(date); };
  const [years, setYears] = useState(INIT_YEARS);
  useEffect(()=>{
    let y = [];
    for (let year = dtTo.getFullYear(); year >= dtFrom.getFullYear(); year--) { y.push(year); }
    setYears(y);
  }, [state, dtFrom, dtTo]);
  const [enabledQs, setEnabledQs] = useState([true, true, true, true, true, true]);
  const updateQ = (index) => {
    setEnabledQs((prevQs) => {
      // Create a new array to maintain immutability
      const updatedQs = [...prevQs]; // Copy the array
      updatedQs[index] = !updatedQs[index]; // Update the specific index
      localStorage.setItem('score-qs', updatedQs);
      console.log('score-qs', updatedQs);
      return updatedQs; // Return the new array
    });
  };

  const scoreUrl = import.meta.env.VITE_URL_SCORE+'&state='+state+'&from='+dtFrom.toLocaleDateString('en-US', dateOptions2)+'&to='+dtTo.toLocaleDateString('en-US', dateOptions2);
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'score', dtFrom, dtTo],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: scoreUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours
    cacheTime: 1000 * 60 * 60 * 12, //12 hours
  });

  let resultsTable;
  if (isPending) { resultsTable = <LoadingIndicator />; }
  if (isError) {
    resultsTable = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch magic data.'} />
    );
  }
  if (data) {
    const qData = data.filter(x => Q_MAP.filter((_, index) => enabledQs[index]).map(eq => eq.q1).includes(x.Q11));
    const dotPlotFooter = (tab == SCORE_TABS[0] || tab == SCORE_TABS[2] || tab == SCORE_TABS[3]) ? (<tfoot>
      <tr>
        <th scope="col" className="rounded-bl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          &nbsp;</th>
        {HEADER_MONTHS.map((month) => {
        return(
        <th key={'tfooter-th-'+month.name} scope="col" className="sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          <div className='grid place-items-center'>
            <div className="bg-gray-800 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
              {qData.filter(x => new Date(x.Dtm).getMonth()==month.number-1).length}
            </div>
            {month.nam}
          </div>
        </th>
        )})}
        <th scope="col" className="rounded-br-lg sticky bottom-0 right-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-8 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          <div className='grid place-items-center'>
            <div className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
              {qData.length}
            </div>
            TOTAL
          </div>
        </th>
      </tr>
    </tfoot>) : "";
    if(tab == SCORE_TABS[0]) resultsTable = (<table className="min-w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th scope="col" className="rounded-tl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
            Year
          </th>
          {HEADER_MONTHS.map((month) => {
          return(
          <th key={month.name} scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
            {month.name}
          </th>
          )})}
          <th scope="col" className="rounded-tr-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
  
          </th>
        </tr>
      </thead>
      <tbody>
        {years.map((year, index) => (
          <tr key={'yr-'+year}>
            <td key={'td0-'+year} className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
              {year}
            </td>
            {HEADER_MONTHS.map((month) => {
              const filterData = qData.filter(
                x => new Date(x.Dtm).getFullYear()==year && new Date(x.Dtm).getMonth()==month.number-1
              );
              return(
              <td key={'td1-'+month.name+'-'+year} className={classNames('bg-white', 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
                {filterData.map((x, i) => {
                  const cBox = x.Magic ? "magic-box" : x.Sq3 ? "trident-box" : "";
                  const ballColor = Q_MAP.filter(q => q.q1 == x.Q11)[0].bg;
                  return(
                  <div key={'td1-span-'+month.name+'-'+year+x+i} className={classNames(cBox, "p-1")}>
                    {/* {JSON.stringify(x)} */}
                    {new Date(x.Dtm).toLocaleDateString('en-US', dateOptions)} {x.Num}
                    <span className="flex items-center">
                      <span className={classNames(ballColor, "w-5 h-5 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md")}>
                        {x.Qdbl}
                      </span>
                      <span className='ml-1'>{x.Q1} {x.Squiggly}</span>
                    </span>
                  </div>
                  )}
                )}
                {/* {filterData.length == 0 && "EMPTY"} */}
              </td>
            )})}
            <td className='border-b border-l border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
              <div className='grid place-items-center'>
                <div className="bg-gray-800 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                  {qData.filter(x => new Date(x.Dtm).getFullYear()==year).length}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      {dotPlotFooter}
    </table>);
    if(tab == SCORE_TABS[1]) {
      resultsTable = (<table className="block min-w-full divide-y divide-gray-300 border-separate border-spacing-0">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="sticky top-0 z-10 bg-yellow-100 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              <span className="flex items-center">
                <span className="bg-gray-900 w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
                  {qData.length}
                </span>
                <span className='ml-1'>Draws</span>
              </span>
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='magic-box p-1'>{qData.filter(q => q.Magic).length} Magics</span>
            </th>
            <th scope="col" colSpan={2} className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='trident-box p-1'>{qData.filter(q => q.Sq3).length} Tidents €</span>
            </th>
            <th scope="col" colSpan={1} className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='pick-box p-1'>{qData.filter(q => q.Pick).length} Picks</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {qData.map((d) => {
            const cBox = d.Magic ? "magic-box p-1" : (d.Sq3 ? "trident-box p-1" : "");
            return(
            <tr key={d.Num + d.Dtm} className={cBox}>
              <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-right">
                {new Date(d.Dtm).toLocaleDateString('en-US', dateOptions2)}
              </td>
              <td className="whitespace-nowrap mb-5 px-3 py-1 text-sm text-gray-500 text-center">
                <span className={cBox}>{d.Num} {new Date(d.Dtm).getHours() == 12 ? "M" : "E"}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-right">
                {new Date(d.Dtm1).toLocaleDateString('en-US', dateOptions2)}
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-left">
                {d.Squiggly}
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-left">
                {d.Pick ? <span className='pick-box p-1 font-bold'>{d.Pick}</span> : "Not in casino"}
              </td>
            </tr>
          )})}
        </tbody>
      </table>);
    }
    if(tab == SCORE_TABS[2]) {
      const days31 = Array.from({ length: 31 }, (_, i) => i + 1);
      resultsTable = (<table className="min-w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th scope="col" className="rounded-tl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">

          </th>
          {HEADER_MONTHS.map((month) => {
          return(
          <th key={month.name} scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
            {month.name}
          </th>
          )})}
          <th scope="col" className="rounded-tr-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">

          </th>
        </tr>
      </thead>
      <tbody>
        {days31.map((d, index) => (
          <tr key={'dot-tr-'+d+index}>
            <td className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
              {d}
            </td>
            {HEADER_MONTHS.map((month) => {
              return(
              <td key={'dot-td1-'+month.name+'-'+d} className={classNames('bg-white', 'border-b border-l border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
                <span className="flex items-center">
                  {qData.filter(x => new Date(x.Dtm).getDate()==d && new Date(x.Dtm).getMonth()==month.number-1)
                  .map((x, i) => (
                    <span key={'dot-span-q-'+d+index+x.Dtm+i} className={classNames(Q_MAP.filter(m => m.q1 == x.Q11)[0].bg, "w-7 h-7 flex items-center justify-center rounded-full text-black font-bold text-xs shadow-md")}>
                    {x.Q1}</span>
                  ))}
                </span>
              </td>
            )})}
            <td className='border-b border-l border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
            <div className='grid place-items-center'>
              <div className="bg-gray-800 w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-base shadow-md">
                {qData.filter(x => new Date(x.Dtm).getDate()==d).length}
              </div>
            </div>
            </td>
          </tr>
        ))}
      </tbody>
      {dotPlotFooter}
      </table>);
    }
    if(tab == SCORE_TABS[3]) resultsTable = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="rounded-tl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">

        </th>
        {HEADER_MONTHS.map((month) => {
        return(
          <th key={"sc3-header-"+month.name} scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          {month.name}
        </th>
        )})}
        <th scope="col" className="rounded-tr-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">

        </th>
      </tr>
    </thead>
    <tbody>
      {years.map((year, index) => (
        <tr key={'dot-tr3-'+year+index}>
          <td className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
            {year}
          </td>
          {HEADER_MONTHS.map((month) => {
            return(
            <td key={'dot-td3-'+month.name+'-'+year} className='bg-white border-b border-l border-gray-200 py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1'>
              <div className="grid grid-cols-3 items-center">
                {qData.filter(x => new Date(x.Dtm).getFullYear()==year && new Date(x.Dtm).getMonth()==month.number-1)
                .map((x, i) => (
                  <div key={'dot-span3-q-'+year+index+x.Dtm+i} className={classNames(Q_MAP.filter(m => m.q1 == x.Q11)[0].bg, "w-7 h-7 flex items-center justify-center rounded-full text-black font-bold text-xs shadow-md")}>
                  {x.Q1}</div>
                ))}
              </div>
            </td>
          )})}
          <td className='border-b border-l border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
          <div className='grid place-items-center'>
            <div className="bg-gray-800 w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-base shadow-md">
              {qData.filter(x => new Date(x.Dtm).getFullYear()==year).length}
            </div>
          </div>
          </td>
        </tr>
      ))}
    </tbody>
    {dotPlotFooter}
    </table>);
    if(tab == SCORE_TABS[4]) {
      const mData = data.filter(x => x.Magic).map((item, index, arr) => {
        if (index < arr.length - 1) {
          const d1 = new Date(item.Dtm);
          const d0 = new Date(arr[index + 1].Dtm); //start (lower) date for calculation
          const addition = d1.getHours()==d0.getHours() ? 0 : d0.getHours()>d1.getHours() ? -1 : 1;
          const mItem = { D0: item.Dtm, D1: arr[index + 1].Dtm,
            Interval: Math.round((d1.setHours(0) - d0.setHours(0)) / (24 * 60 * 60 * 1000) * 2) + addition
          };
          return mItem; // Difference between current and next
        } else {
          return null; // Handle the last item, which has no "next"
        }
      }).filter(item => item !== null).sort((a, b) => a.Interval - b.Interval);
      resultsTable = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        {MAGIC_INTERVAL.map((inter, index) => {
        return(
          <th key={"mi4-header-"+inter.max} scope="col" className={classNames(index==0 ? "rounded-tl-lg" : index == MAGIC_INTERVAL.length -1 ? "rounded-tr-lg" : "", "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
          {inter.text}
        </th>
        )})}
      </tr>
    </thead>
    <tbody>
      <tr>
        {MAGIC_INTERVAL.map((inter, index) => {
          return(
          <td key={'mi4-td-'+inter.max} className={classNames(index==0 ? "rounded-bl-lg" : index == MAGIC_INTERVAL.length -1 ? "rounded-br-lg" : "", "align-top bg-white border-b border-l border-gray-200 py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1")}>
            <div className="grid grid-cols-1 place-items-center">
              {mData.filter(m => m.Interval >= inter.min && m.Interval <= inter.max).map((x, i) => (
                <div key={'mi4-item-'+inter.max+x.D1} className="bg-gray-800 mb-1 w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                {x.Interval}</div>
              ))}
            </div>
          </td>
        )})}
      </tr>
    </tbody>
    </table>);
    }
  }
  //const selectedQs = Q_MAP.filter((_, index) => enabledQs[index]).map(eq => eq.q1);
  const qRow = data && (tab !== SCORE_TABS[4]) ? (<tr>
    <th colSpan="2" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
      <div className="flex justify-center items-center">
      {Q_MAP.map((q, i) => (
      <div key={'qlist-top'+q.q} className='grid place-items-center'>
        <div onClick={() => updateQ(i)} key={'qlist-'+q.q} className={classNames(enabledQs[i] ? q.bg : "bg-white", "ml-5 w-10 h-10 flex items-center justify-center rounded-full text-black font-bold text-lg shadow-md")}>
          {enabledQs[i] ? data.filter(d => d.Q11 == q.q1).length : q.q} </div>
          {enabledQs[i] && <span className='pl-4'>{q.q}</span>}
      </div>
      ))}
      </div>
      {/* {JSON.stringify(selectedQs)} */}
    </th>
  </tr>) : "";

  const content = (<div className="flex">
    <div className="grid grid-cols-1 justify-items-center">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <table className="divide-y divide-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th colSpan={2} className="pt-2">
                <div className="flex justify-center items-center">
                  <Tabs onTabChange={handleTabChange} selectedTab={tab} tabList={SCORE_TABS} />
                </div>
              </th>
            </tr>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                From: <DatePicker selected={dtFrom} onChange={handleFromChange} />
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                To: <DatePicker selected={dtTo} onChange={handleToChange} />
              </th>
            </tr>
            {qRow}
          </thead>
        </table>
      </div>
      <div>{resultsTable}</div>
    </div>
  </div>);

  return (
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="mt-0 flow-root">
      <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle grid">
          {content}
        </div>
      </div>
    </div>
  </div>
)
}
