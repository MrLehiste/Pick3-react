import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Tabs from './Tabs.jsx';
import { HEADER_MONTHS, Q_MAP, MAGIC_INTERVAL } from './UI/constants';
import SvgEve from './SvgEve.jsx';
import SvgMid from './SvgMid.jsx';

const INIT_FROM = new Date(2019, 0, 1);
const INIT_TO = new Date();
const INIT_YEARS = [];
//const bgColors = ['bg-pink-300','bg-green-400','bg-amber-600','bg-red-500','bg-blue-600','bg-yellow-300'];

export default function ContentScoreboard({ state, onPageChange }) {
  const dateOptions = { month: 'numeric', day: 'numeric' };
  const dateOptions2 = { month: 'numeric', day: 'numeric', year: 'numeric' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const SCORE_TABS = ['Horizontal ==', 'Vertical ||', 'Days Dot Plot', 'Years Dot Plot', 'Magic Interval', 'Clusters'];
  const [tab, setTab] = useState(SCORE_TABS[0]);
  const handleTabChange = (value) => { setTab(value); localStorage.setItem('score-tab', value); onPageChange("1. Scoreboard" ); };
  const [dtFrom, setDtFrom] = useState(INIT_FROM);
  const handleFromChange = (date) => { setDtFrom(date); localStorage.setItem('score-from', date); };
  
  // Add state for number filtering
  const [numFilterActive, setNumFilterActive] = useState(-1);
  const [clickedCell, setClickedCell] = useState(null);
  const [highlightedCluster, setHighlightedCluster] = useState(null);
  
  useEffect(() => {
    const storedTab = localStorage.getItem('score-tab');
    if (storedTab) { setTab(storedTab); onPageChange("1. Scoreboard" ); }
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
  const [magic, setMagic] = useState(false);
  const handleMagicToggle = () => { setMagic(prevMagic => !prevMagic); };
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

  // Handle cell click for number filtering
  const handleCellClick = (year, month, xnum) => {
    const cellKey = `${year}-${month}-${xnum}`;
    if (clickedCell === cellKey) {
      // If clicking the same cell, reset filter
      setNumFilterActive(-1);
      setClickedCell(null);
    } else {
      // Set new filter
      setNumFilterActive(parseInt(xnum));
      setClickedCell(cellKey);
    }
  };

  const scoreUrl = import.meta.env.VITE_URL_SCORE+'&state='+state+'&from='+dtFrom.toLocaleDateString('en-US', dateOptions2)+'&to='+dtTo.toLocaleDateString('en-US', dateOptions2);
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'score', dtFrom, dtTo],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: scoreUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours
    cacheTime: 1000 * 60 * 60 * 12, //12 hours
  });
  const [notesData, setNotesData] = useState([]);

  // Define fetchNotes outside useEffect so it can be reused
  const fetchNotes = async () => {
    if (tab === SCORE_TABS[5]) {
      try {
        const notesUrl = import.meta.env.VITE_URL_NOTES + '&state=' + state + '&tab=Clusters';
        const notesResponse = await fetch(notesUrl);
        const notesData = await notesResponse.json();
        setNotesData(notesData);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
  };

  useEffect(() => {
    if (tab === SCORE_TABS[5]) {
      fetchNotes();
    } else {
      // Clear notes when not on tab 5
      //setNotesData([]);
    }
  }, [tab, state]);

  let resultsTable;
  if (isPending) { resultsTable = <LoadingIndicator />; }
  if (isError) {
    resultsTable = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch magic data.'} />
    );
  }
  if (data) {
    // Apply number filter if active
    let qData = data.filter(d => magic ? d.Magic || d.Sq3 : d).filter(x => Q_MAP.filter((_, index) => enabledQs[index]).map(eq => eq.q1).includes(x.Q11));
    
    if (numFilterActive >= 0 && tab === SCORE_TABS[0]) {
      qData = qData.filter(x => {
        const num = parseInt(x.Num);
        const minnum = parseInt(numFilterActive) - 15;
        const maxnum = parseInt(numFilterActive) + 15;
        return num >= minnum && num <= maxnum;
      });
    }
    
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
        {tab !== SCORE_TABS[0] && (
          <th scope="col" className="rounded-br-lg sticky bottom-0 right-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-8 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
            <div className='grid place-items-center'>
              <div className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                {qData.length}
              </div>
              TOTAL
            </div>
          </th>
        )}
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
        </tr>
      </thead>
      <tbody>
        {years.map((year, index) => (
          <tr key={'yr-'+year}>
            <td key={'td0-'+year} className='sticky left-0 z-11 border-b border-gray-800 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
              {year}
            </td>
            {HEADER_MONTHS.map((month) => {
              const filterData = qData.filter(
                x => new Date(x.Dtm).getFullYear()==year && new Date(x.Dtm).getMonth()==month.number-1
              ).sort((a, b) => new Date(a.Dtm) - new Date(b.Dtm));
              const isClickedCell = clickedCell === `${year}-${month.name}`;
              return(
              <td 
                key={'td1-'+month.name+'-'+year} 
                className={classNames(
                  'bg-white cursor-pointer hover:bg-gray-50', 
                  isClickedCell ? 'bg-blue-100' : '',
                  'border-b border-l border-gray-800 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1'
                )}
              >
                {filterData.map((x, i) => {
                  const cBox = x.Magic ? "magic-box" : x.Sq3 ? "trident-box" : "";
                  const ballColor = Q_MAP.filter(q => q.q1 == x.Q11)[0].bg;
                  return(
                  <div key={'td1-span-'+month.name+'-'+year+x+i} className={classNames(cBox, "p-1", x.Pick ? "bg-yellow-300" : "")}
                    onClick={() => handleCellClick(year, month.name, x.Num)}>
                    {/* {JSON.stringify(x)} */}
                    {new Date(x.Dtm).toLocaleDateString('en-US', dateOptions)} {x.Num} {new Date(x.Dtm).getHours() == 12 ? <span><SvgMid color="text-orange-500" /></span> : <span><SvgEve /></span>}
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
          </tr>
        ))}
      </tbody>
      {dotPlotFooter}
    </table>);
    if(tab == SCORE_TABS[1]) {
      resultsTable = (<table className="table-auto block min-w-full divide-y divide-gray-300 border-separate border-spacing-0">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="sticky top-0 z-10 bg-yellow-100 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              <span className="flex items-center">
                <span className="bg-gray-900 w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
                  {qData.length}
                </span>
                <span className='ml-1'>Hits</span>
              </span>
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='magic-box p-1'>{qData.filter(q => q.Magic).length} Magics</span>
            </th>
            <th scope="col" colSpan={2} className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='trident-box p-1'>{qData.filter(q => q.Sq3).length} Tridents €</span>
            </th>
            <th scope="col" colSpan={1} className="sticky top-0 z-10 bg-yellow-100 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className='pick-box p-1'>{qData.filter(q => q.Pick).length} Picks</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white space-y-10">
          {qData.map((d) => {
            const cBox = d.Magic ? "magic-box pl-1 pr-1" : (d.Sq3 ? "trident-box pl-1 pr-1" : "");
            return(
            <tr key={d.Num + d.Dtm} className="">
              <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-right">
                {new Date(d.Dtm).toLocaleDateString('en-US', dateOptions2)}
              </td>
              <td className="whitespace-nowrap m-5 px-3 py-1 text-sm text-gray-500 text-center">
                <span className={cBox}>{d.Num} {new Date(d.Dtm).getHours() == 12 ? <span><SvgMid /> Mid</span> : <span><SvgEve /> Eve</span>}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-right">
                {new Date(d.Dtm1).toLocaleDateString('en-US', dateOptions2)}
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-left">
                {d.Squiggly}
              </td>
              <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500 text-left">
                {d.Pick ? <span className='pick-box pl-1 pr-1 font-bold'>{d.Pick}</span> : "Not in casino"}
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
      const d0 = new Date(data.filter(x => x.Magic)[0].Dtm);
      const d1 = new Date();
      const addition = d1.getHours()==d0.getHours() ? 0 : d0.getHours()>d1.getHours() ? -1 : 1;
      const lastMagic = Math.round((d1.setHours(0) - d0.setHours(0)) / (24 * 60 * 60 * 1000) * 2) + addition
      console.log("lastMagic", lastMagic);
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
        <th key={"mi4-header-"+inter.max} scope="col" className={classNames(index==0 ? "rounded-tl-lg" : index == MAGIC_INTERVAL.length -100 ? "rounded-tr-lg" : "", "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
          {inter.text}
        </th>
        )})}
        <th scope="col" className={classNames("rounded-tr-lg", "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
          Last Magic
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        {MAGIC_INTERVAL.map((inter, index) => {
          return(
          <td key={'mi4-td-'+inter.max} className={classNames(index==0 ? "rounded-bl-lg" : index == MAGIC_INTERVAL.length -100 ? "rounded-br-lg" : "", "align-top bg-white border-b border-l border-gray-200 py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1")}>
            <div className="grid grid-cols-1 place-items-center">
              {mData.filter(m => m.Interval >= inter.min && m.Interval <= inter.max).map((x, i) => (
                <div key={'mi4-item-'+inter.max+x.D1} className="bg-gray-800 mb-1 w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                {x.Interval}</div>
              ))}
            </div>
          </td>
        )})}
        <td className={classNames("rounded-br-lg", "align-top bg-white border-b border-l border-gray-200 py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1")}>
          <div className="grid grid-cols-1 place-items-center">
            <div className="bg-gray-200 mb-1 w-12 h-12 flex items-center justify-center rounded-full text-black font-bold text-lg shadow-md">
              {lastMagic}</div>
          </div>
        </td>
      </tr>
    </tbody>
    </table>);
    }
    if(tab == SCORE_TABS[5]) {
      // Handle cluster click in tab 5
      const handleClusterClick = (num) => {
        const numInt = parseInt(num);
        if (highlightedCluster === numInt) {
          // If clicking the same cluster, clear highlight
          setHighlightedCluster(null);
        } else {
          // Set new highlight
          setHighlightedCluster(numInt);
        }
      };
      
      // Check if a number is within the highlighted cluster range
      const isInHighlightedCluster = (num) => {
        if (highlightedCluster === null) return false;
        const numInt = parseInt(num);
        return numInt >= (highlightedCluster - 15) && numInt <= (highlightedCluster + 15);
      };
      
      // Get count of hits in the highlighted cluster
      const getClusterHitCount = () => {
        if (highlightedCluster === null) return 0;
        const minNum = highlightedCluster - 15;
        const maxNum = highlightedCluster + 15;
        return qData.filter(x => {
          const num = parseInt(x.Num);
          return num >= minNum && num <= maxNum;
        }).length;
      };
      
      // Check which hundred range the highlighted cluster belongs to
      const getHighlightedRange = () => {
        if (highlightedCluster === null) return null;
        const hundred = Math.floor(highlightedCluster / 100) * 100;
        return hundred;
      };

      const numberMap = new Map();
      qData.forEach(x => {
        const num = x.Num;
        if (!numberMap.has(num)) {
          numberMap.set(num, []);
        }
        numberMap.get(num).push(x);
      });
      
      const ranges = [];
      for (let i = 0; i < 10; i++) {
        ranges.push({
          start: i * 100,
          end: (i * 100) + 99,
          label: `${i}00-${i}99`
        });
      }
      
      const highlightedRange = getHighlightedRange();
      const clusterHitCount = getClusterHitCount();
      resultsTable = (
        <div className="w-full p-4">
        {ranges.map(range => {
          // Check if this range has any hits
          let hasHitsInRange = false;
          for (let num = range.start; num <= range.end; num++) {
            if (numberMap.has(num.toString().padStart(3, '0'))) {
              hasHitsInRange = true;
              break;
            }
          }
          
          if (!hasHitsInRange) return null;
          
          // Create a 10x10 grid for this hundred range
          const grid = [];
          for (let row = 0; row < 10; row++) {
            const rowData = [];
            for (let col = 0; col < 10; col++) {
              const num = (range.start + row * 10 + col).toString().padStart(3, '0');
              rowData.push({
                num: num,
                hits: numberMap.get(num) || []
              });
            }
            grid.push(rowData);
          }

          //Note Input component
          const NoteInput = ({ state, tab, p100, onNoteAdded }) => {
            const [noteText, setNoteText] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);
          
            const handleSubmit = async (e) => {
              e.preventDefault();
              
              if (!noteText.trim()) {
                return;
              }
          
              setIsSubmitting(true);
          
              try {
                // URL encode the parameters
                const params = new URLSearchParams({
                  action: 'insert',
                  st: state,
                  dtm: new Date().toISOString(),
                  tab: tab,
                  p100: p100,
                  note: noteText.trim()
                });
                
                const insertUrl = `${import.meta.env.VITE_URL_NOTES}&${params.toString()}`;
                const response = await fetch(insertUrl);
          
                if (response.ok) {
                  setNoteText('');
                  if (onNoteAdded) {
                    onNoteAdded();
                  }
                } else {
                  console.error('Failed to add note');
                }
              } catch (error) {
                console.error('Error adding note:', error);
              } finally {
                setIsSubmitting(false);
              }
            };
          
            return (
              <form onSubmit={handleSubmit} className="ml-8 mt-2 mb-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!noteText.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>
            );
          };
          const handleNoteAdded = () => {
            // Refetch notes after adding
            fetchNotes();
          };
          // Styled note display component
          const NoteDisplay = ({ notes, onNoteDeleted }) => {
            const handleDelete = async (noteId) => {
              if (!window.confirm('Are you sure you want to delete this note?')) {
                return;
              }
          
              try {
                const deleteUrl = `${import.meta.env.VITE_URL_NOTES}&id=${noteId}&action=delete`;
                const response = await fetch(deleteUrl);
          
                if (response.ok) {
                  if (onNoteDeleted) {
                    onNoteDeleted(noteId);
                  }
                } else {
                  console.error('Failed to delete note');
                }
              } catch (error) {
                console.error('Error deleting note:', error);
              }
            };
          
            return (
              <div className="ml-8 mt-2 space-y-2 max-w-[560px]">
                {notes.map((note, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(note.Dtm).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                          {note.Note}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(note.Id)}
                        className="ml-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          }; //NotesDisplay
          const handleNoteDeleted = (deletedNoteId) => {
            // Remove the deleted note from state
            setNotesData(prevNotes => prevNotes.filter(note => note.Id !== deletedNoteId));
            // Or refetch all notes
            // fetchNotes();
          };
          
          return (
            <div key={range.label} className="mb-1">
              <h4 className="text-md font-semibold text-gray-800 mb-2">{range.label}</h4>
              
              {/* Show highlight bar only for the range containing the highlighted cluster */}
              {highlightedCluster !== null && highlightedRange === range.start && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-semibold">
                      Cluster {highlightedCluster}: Range {Math.max(0, highlightedCluster - 15)} to {Math.min(999, highlightedCluster + 15)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {clusterHitCount} hit{clusterHitCount !== 1 ? 's' : ''} in cluster
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHighlightedCluster(null)}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              <div className="inline-block border border-gray-300">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 p-1 bg-gray-100 text-xs"></th>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                        <th key={col} className="border border-gray-200 p-1 bg-gray-100 text-xs font-semibold w-16">
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border border-gray-200 p-1 bg-gray-100 text-xs font-semibold">
                        </td>
                        {row.map((cell, colIndex) => {
                          const isHighlighted = isInHighlightedCluster(cell.num);
                          return (
                            <td 
                              key={colIndex} 
                              className={classNames(
                                "border border-gray-200 p-1 align-center transition-all duration-200",
                                isHighlighted ? "bg-yellow-100" : "bg-white"
                              )}
                            >
                              <div className="flex flex-wrap gap-0.5 justify-center items-center">
                                {cell.hits.length > 0 ? (
                                  cell.hits.map((hit, hitIndex) => {
                                    const hasPick = hit.Pick !== null;
                                    const isMagic = hit.Magic;
                                    const isTrident = hit.Sq3;
                                    
                                    // Determine color
                                    let bgColor = 'bg-gray-400'; // default
                                    if (isMagic) bgColor = 'bg-black';
                                    else if (isTrident) bgColor = 'bg-purple-600';
                                    
                                    // Add highlight effect
                                    const ringClass = isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-75' : '';
                                    
                                    return (
                                      <div
                                        key={`${cell.num}-${hitIndex}`}
                                        className="flex flex-col items-center gap-1"
                                      >
                                        {/* Ball */}
                                        <div
                                          className={classNames(
                                            'relative w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 shadow-sm',
                                            bgColor,
                                            ringClass
                                          )}
                                          onClick={() => handleClusterClick(cell.num)}
                                          title={`${cell.num}: ${hit.Q1} ${hit.Squiggly} ${hasPick ? '(Pick: ' + hit.Pick + ')' : ''} - Click to highlight cluster`}
                                        >
                                          <span className="text-white font-bold" style={{ fontSize: '12px' }}>
                                            {cell.num}
                                          </span>
                                          {hasPick && <span className="absolute -top-2 -right-2" style={{ fontSize: '12px' }}>✨</span>}
                                        </div>
                                        
                                        {/* Month/Year display */}
                                        <div className="text-xs text-gray-600 whitespace-nowrap" style={{ fontSize: '10px' }}>
                                          {new Date(hit.Dtm).toLocaleString('en-US', { 
                                            month: 'short', 
                                            year: '2-digit' 
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="w-1 h-1"></div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot></tfoot>
                </table>
              </div>
              <NoteInput state={state} tab="Clusters" p100={range.start} onNoteAdded={handleNoteAdded} />
              <NoteDisplay notes={notesData.filter(note => note.P100 === range.start)} onNoteDeleted={handleNoteDeleted} />
            </div>
          );
        })}
        
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h4>
            <div className="flex gap-4 text-xs items-center">
              <div className="flex items-center">
                <div className="w-7 h-7 bg-black rounded-full mr-1 flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: '9px' }}>###</span>
                </div>
                <span>Magic</span>
              </div>
              <div className="flex items-center">
                <div className="w-7 h-7 bg-purple-600 rounded-full mr-1 flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: '9px' }}>###</span>
                </div>
                <span>Trident €</span>
              </div>
              <div className="flex items-center">
                <div className="w-7 h-7 bg-gray-400 rounded-full mr-1 flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: '9px' }}>###</span>
                </div>
                <span>Other</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">✨</span>
                <span>Pick</span>
              </div>
              <div className="flex items-center">
                <div className="w-7 h-7 bg-yellow-100 border-2 border-yellow-400 rounded mr-1"></div>
                <span>Cluster Highlight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    }
  }
  //const selectedQs = Q_MAP.filter((_, index) => enabledQs[index]).map(eq => eq.q1);
  const qRow = data && (tab !== SCORE_TABS[4]) ? (<tr>
    <th colSpan="2" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
      <div className="flex justify-center items-center">
      <div className='grid place-items-center'>
        <div onClick={handleMagicToggle} className={classNames(magic ? "bg-gray-900 text-white" : "bg-white text-gray-900", "ml-5 w-10 h-10 flex items-center justify-center rounded-full text-black font-bold text-lg shadow-md")}>
          {data.filter(d => magic ? d.Magic || d.Sq3 : d).filter(x => Q_MAP.filter((_, index) => enabledQs[index]).map(eq => eq.q1).includes(x.Q11)).length} 
        </div>
        <span className='pl-4'>{magic ? "Magic/Tri€" : "All Hits"}</span>
      </div>
      {Q_MAP.map((q, i) => (
      <div key={'qlist-top'+q.q} className='grid place-items-center'>
        <div onClick={() => updateQ(i)} key={'qlist-'+q.q} className={classNames(enabledQs[i] ? q.bg : "bg-white", "ml-5 w-10 h-10 flex items-center justify-center rounded-full text-black font-bold text-lg shadow-md")}>
          {enabledQs[i] ? data.filter(d => magic ? d.Magic || d.Sq3 : d).filter(d => d.Q11 == q.q1).length : q.q} </div>
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
            {numFilterActive >= 0 && tab === SCORE_TABS[0] && (
              <tr>
                <th colSpan={2} className="px-3 py-2 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                <span className="text-blue-700">Cluster {numFilterActive} Active: between {Math.max(0, numFilterActive - 15)} and {Math.min(999, numFilterActive + 15)}</span>
                <button 
                    onClick={() => { setNumFilterActive(-1); setClickedCell(null); }}
                    className="ml-3 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Clear Cluster
                  </button>
                </th>
              </tr>
            )}
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