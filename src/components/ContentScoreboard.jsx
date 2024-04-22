import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import { Fragment } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { Switch } from '@headlessui/react';

const INIT_FROM = new Date(2019, 0, 1);
const INIT_TO = new Date();
const INIT_YEARS = [];
const HEADER_MONTHS = [
  { nam: 'Jan', name: 'January', number: 1 },
  { nam: 'Feb', name: 'February', number: 2 },
  { nam: 'Mar', name: 'March', number: 3 },
  { nam: 'Apr', name: 'April', number: 4 },
  { nam: 'May', name: 'May', number: 5 },
  { nam: 'Jun', name: 'June', number: 6 },
  { nam: 'Jul', name: 'July', number: 7 },
  { nam: 'Aug', name: 'August', number: 8 },
  { nam: 'Sep', name: 'September', number: 9 },
  { nam: 'Oct', name: 'October', number: 10 },
  { nam: 'Nov', name: 'November', number: 11 },
  { nam: 'Dec', name: 'December', number: 12 }
];

export default function Scoreboard({ state }) {
  const dateOptions = { month: 'numeric', day: 'numeric' };
  const dateOptions2 = { month: 'numeric', day: 'numeric', year: 'numeric' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const [dtFrom, setDtFrom] = useState(INIT_FROM);
  const handleFromChange = (date) => { setDtFrom(date); };
  const [dtTo, setDtTo] = useState(INIT_TO);
  const handleToChange = (date) => { setDtTo(date); };
  const [years, setYears] = useState(INIT_YEARS);
  useEffect(()=>{
    let y = [];
    for (let year = dtTo.getFullYear(); year >= dtFrom.getFullYear(); year--) { y.push(year); }
    setYears(y);
  }, [state, dtFrom, dtTo]);

  const scoreUrl = import.meta.env.VITE_URL_SCORE+'&state='+state+'&from='+dtFrom.toLocaleDateString('en-US', dateOptions2)+'&to='+dtTo.toLocaleDateString('en-US', dateOptions2);
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, 'score', dtFrom, dtTo],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: scoreUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours
    cacheTime: 1000 * 60 * 60 * 12, //12 hours
  });

  let content;
  if (isPending) { content = <LoadingIndicator />; }
  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch magic data.'} />
    );
  }
  const [enabled, setEnabled] = useState(false);
  const bgColors = ['bg-pink-300','bg-green-400','bg-amber-600','bg-red-500','bg-blue-700','bg-yellow-300'];
  if (data) {
    const resultsTable = !enabled ? (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
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
          <td key={'td0-'+year} className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
            {year}
          </td>
          {HEADER_MONTHS.map((month) => {
            let bgColor = 'bg-white'; //

            const filterData = data.filter(
              x => new Date(x.Dtm).getFullYear()==year && new Date(x.Dtm).getMonth()==month.number-1
            );
            return(
            <Fragment key={"frag-"+month.name+year}>
            <td key={'td1-'+month.name+'-'+year} className={classNames('bg-white', 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
              {filterData.map((x, i) => {
                let c = "";
                if(x.Sq3) c="trident-box";
                if(x.Magic) c="magic-box";
                let bgColor = 'bg-white'; 
                if(x){
                  switch(x['Q1']){
                    case "BOT": bgColor = bgColors[0]; break;
                    case "GRN": bgColor = bgColors[1]; break;
                    case "BRN": bgColor = bgColors[2]; break;
                    case "FRG": bgColor = bgColors[3]; break;
                    case "DBL": bgColor = bgColors[4]; break;
                    default: bgColor = bgColors[5]; //Q
                  }
                }
                return(
                <div key={'td1-span-'+month.name+'-'+year+x+i} className={classNames(c, "p-1")}>
                  {/* {JSON.stringify(x)} */}
                  {new Date(x.Dtm).toLocaleDateString('en-US', dateOptions)} {x.Num}
                  <span className="flex items-center">
                    <span className={classNames(bgColor, "w-5 h-5 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md")}>
                      {x.Qdbl}
                    </span> 
                    <span className='ml-1'>{x.Q1} {x.Squiggly}</span>
                  </span>
                </div>
                )}
              )}
            </td>
            </Fragment>
          )})}
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <th scope="col" className="sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          &nbsp;</th>
        {HEADER_MONTHS.map((month) => {
        let bgColor = 'bg-gray-500';
        return(
        <th key={'tfooter-th-'+month.name} scope="col" className="sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          <div className={classNames(bgColor, "hypnotic-circle w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md")}>
            {month.nam}
          </div>
        </th>
        )})}
      </tr>
    </tfoot>
  </table>) : (<table className="block min-w-full divide-y divide-gray-300 border-separate border-spacing-0">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
          <span className="flex items-center">
            <span className="bg-gray-900 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md">
              {data.length}
            </span> 
            <span className='ml-1'>Nums</span>
          </span>
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
          
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
        
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {data.map((d) => { 
        const cBox = d.Magic ? "magic-box" : (d.Sq3 ? "trident-box" : "");
        return(
        <tr key={d.Num + d.Dtm} className={cBox}>
          <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
            {new Date(d.Dtm).toLocaleDateString('en-US', dateOptions2)}
          </td>
          <td className={classNames(cBox, "whitespace-nowrap px-3 py-1 text-sm text-gray-500")}>
            {d.Num} {new Date(d.Dtm).getHours() == 12 ? "M" : "E"}
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {new Date(d.Dtm1).toLocaleDateString('en-US', dateOptions2)}
          </td>
          <td className="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
            {d.Squiggly}
          </td>
          
        </tr>
      )})}
    </tbody>
  </table>);
    content = (<div className="flex">
      <div className="grid grid-cols-1 justify-items-center">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <table className="divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th colSpan="1" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                <Switch.Group as="div" className="flex items-center justify-between">
                  <span className="flex flex-grow flex-col">
                    <Switch.Label as="span" className="text-sm font-medium text-gray-900" passive>
                      Horizontal ==
                    </Switch.Label>
                  </span>
                  <Switch
                    checked={enabled}
                    onChange={setEnabled}
                    className={classNames(
                      enabled ? 'bg-indigo-500' : 'bg-green-500',
                      'relative inline-flex ml-2 h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={classNames(
                        enabled ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                      )}
                    />
                  </Switch>
                  <Switch.Label as="span" className="ml-3 text-sm">
                    <span className="font-medium text-gray-900">Vertical ||</span>
                  </Switch.Label>
                </Switch.Group>
                </th>
                <th></th>
              </tr>
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  From: <DatePicker selected={dtFrom} onChange={handleFromChange} />
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  To: <DatePicker selected={dtTo} onChange={handleToChange} />
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">{resultsTable}</div>
      </div>
    </div>);
  }


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
