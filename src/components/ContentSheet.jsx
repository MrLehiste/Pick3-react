import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import { Fragment } from 'react';

const INIT_YEARS = [];
const HEADER_MONTHS = [
  { name: 'January', number: 1 },
  { name: 'February', number: 2 },
  { name: 'March', number: 3 },
  { name: 'April', number: 4 },
  { name: 'May', number: 5 },
  { name: 'June', number: 6 },
  { name: 'July', number: 7 },
  { name: 'August', number: 8 },
  { name: 'September', number: 9 },
  { name: 'October', number: 10 },
  { name: 'November', number: 11 },
  { name: 'December', number: 12 }
];

export default function ContentSheet({state, num, onMonthClick}) {
  const dateOptions = { month: 'numeric', day: 'numeric' };
  const dateOptions2 = { month: 'numeric', day: 'numeric', year: '2-digit' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const [years, setYears] = useState(INIT_YEARS);
  useEffect(()=>{
    let y = [];
    let startYear = 1988; //Florida
    if(state=="ar") startYear = 2009;
    if(state=="mo") startYear = 1998;
    console.log(state, startYear);
    for (let year = new Date().getFullYear(); year >= startYear; year--) { y.push(year); }
    setYears(y);
  }, [state]);

  function findLowestDate(dateField, array) {
    const validDates = array.filter(item => item[dateField]);
    if (validDates.length === 0) return null;
    let lowestDateRow = validDates[0]; //new Date(validDates[0][dateField]);
    for (let i = 1; i < validDates.length; i++) {
      const currentDate = new Date(validDates[i][dateField]);
      if (!isNaN(currentDate.getTime()) && currentDate < new Date(lowestDateRow[dateField])) {
        lowestDateRow = validDates[i];
      }
    }
    return lowestDateRow;
  }
  function removeDuplicates(fields, arr) {
    const uniqueMap = new Map();
    arr.forEach(obj => {
        const key = fields.map(field => obj[field]).join('|');
        uniqueMap.set(key, obj);
    });
    return Array.from(uniqueMap.values());
  }

  const panelUrl = import.meta.env.VITE_URL_PANEL+'&month=0&state='+state+'&num='+num; 
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'panel', 0],
    queryFn: ({ signal, queryKey }) => fetchData({ signal, url: panelUrl }),
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
  const handleMonthClick = (mo) => { onMonthClick(mo); };
  const bgColors = ['bg-pink-300','bg-green-400','bg-amber-600','bg-red-500','bg-blue-700','bg-yellow-300'];
  if (data) {
    content = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="rounded-tl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          Year
        </th>
        {HEADER_MONTHS.map((month) => {
        let closeRow = findLowestDate('Dt2',data.filter(x => new Date(x.Dt).getMonth()==month.number-1));
        let bgColor = 'bg-white'; 
            if(closeRow){
              switch(closeRow['Q']){
                case "BOT": bgColor = bgColors[0]; break;
                case "GRN": bgColor = bgColors[1]; break;
                case "BRN": bgColor = bgColors[2]; break;
                case "FRG": bgColor = bgColors[3]; break;
                case "DBL": bgColor = bgColors[4]; break;
                default: bgColor = bgColors[5]; //Q
              }
            }
        const cRoundTopRight = month.number == 12 ? "rounded-tr-lg" : "";
        const monthData = closeRow ? (
          <span className='font-normal text-xs '>
            {new Date(closeRow.Dt2).toLocaleDateString('en-US', dateOptions2) }
            <br />{closeRow.Num2} {closeRow.Me2}
            {/* <br />{closeRow.R2} BALL */}
            <br />
            <span className="flex items-center">
              <span className={classNames(bgColor, "w-5 h-5 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md")}>
                {closeRow.R2}
              </span> 
              <span className='ml-1'>{closeRow.Q}</span>
            </span>
          </span>)
          : "OPEN";
        return(
        <th colSpan="3" onClick={() => handleMonthClick(month.number)} key={month.name} scope="col" className={classNames(cRoundTopRight, "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
          {month.name}<br />
          {monthData} 
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
            let closeRow = findLowestDate('Dt2',data.filter(x => new Date(x.Dt).getMonth()==month.number-1));
            //console.log('LowestDate.ROW', closeRow);
            let bgColor = 'bg-white'; //
            if(closeRow && year >= new Date(closeRow['Dt']).getFullYear() && year <= new Date(closeRow['Dt2']).getFullYear()){ // && year >= 2015 && year <= 2021
              switch(closeRow['Q']){
                case "BOT": bgColor = bgColors[0]; break;
                case "GRN": bgColor = bgColors[1]; break;
                case "BRN": bgColor = bgColors[2]; break;
                case "FRG": bgColor = bgColors[3]; break;
                case "DBL": bgColor = bgColors[4]; break;
                default: bgColor = bgColors[5]; //Q
              }
            }
            const filterData = removeDuplicates(['Num','Dt','Q'], data.filter(
              x => new Date(x.Dt).getFullYear()==year && new Date(x.Dt).getMonth()==month.number-1
            ));
            return(
            <Fragment key={"frag-"+month.name+year}>
            <td key={'td1-'+month.name+'-'+year} className={classNames('bg-white', 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
              {filterData.map((x, i) => {
                let c = "";
                if(closeRow && x.Dt == closeRow.Dt2) c="border-t-4 border-gray-900";
                if(closeRow && x.Dt == closeRow.Dt) c="border-b-4 border-gray-900";
                if(x.Magic) c += " magic-box";
                return( 
                <span key={'td1-span-'+month.name+'-'+year+x+i} className={c}>
                  {i !==0 && <br />}
                  {x.Num}
                </span> 
                )}
              )}
            </td>
            <td key={'td2-'+month.name+'-'+year} className={classNames(bgColor, 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-normal text-gray-900 sm:pl-1 lg:pl-1')}>

            </td>
            <td key={'td3-'+month.name+'-'+year} className={classNames('bg-white', 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-normal text-gray-900 sm:pl-1 lg:pl-1')}>
              {filterData.map((x, i) => {
                let c = "";
                if(closeRow && x.Dt == closeRow.Dt2) c="border-t-4 border-gray-900";
                if(closeRow && x.Dt == closeRow.Dt) c="border-b-4 border-gray-900";return( 
                <span key={'td3-'+month.name+'-'+year+x+i} className={c}>
                  {i !==0 && <br />}
                  {x.Q}&nbsp;
                  {new Date(x.Dt).toLocaleDateString('en-US', dateOptions)}
                </span> 
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
        let closeRow = findLowestDate('Dt2',data.filter(x => new Date(x.Dt).getMonth()==month.number-1));
        const monthData = closeRow ? parseInt(closeRow.R2)+1 : "-";
        let bgColor = 'bg-gray-500'; //&& year >= new Date(closeRow['Dt']).getFullYear() && year <= new Date(closeRow['Dt2']).getFullYear()
            if(closeRow){
              switch(closeRow['Q']){
                case "BOT": bgColor = bgColors[0]; break;
                case "GRN": bgColor = bgColors[1]; break;
                case "BRN": bgColor = bgColors[2]; break;
                case "FRG": bgColor = bgColors[3]; break;
                case "DBL": bgColor = bgColors[4]; break;
                default: bgColor = bgColors[5]; //Q
              }
            }
        return(
        <th colSpan="3" onClick={() => handleMonthClick(month.number)} key={'tfooter-th-'+month.name} scope="col" className="sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          <div className={classNames(bgColor, "w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md")}>
            {monthData}
          </div>
        </th>
        )})}
      </tr>
    </tfoot>
  </table>);
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
