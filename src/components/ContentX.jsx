import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';

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

export default function ContentX({state, num, onMonthClick}) {
  const dateOptions = { month: 'numeric', day: 'numeric' };
  const dateOptions2 = { month: 'numeric', day: 'numeric', year: '2-digit' };
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const [years, setYears] = useState(INIT_YEARS);
  useEffect(()=>{
    let y = [];
    let startYear = 1988; //Florida
    if(state=="ar") startYear = 2009;
    for (let year = new Date().getFullYear(); year >= startYear; year--) { y.push(year); }
    setYears(y);
  }, []);

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

  const panelUrl = 'https://pick3-function-api.azurewebsites.net/api/Panel?month=0&state='+state+'&num='+num+'&code=jObvEG0duLEYTPf4ig4D0q6CiCicMZZJeDHbnamUnKsSTVGuj2FVLw=='; 
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
  if (data) {
    content = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          Year
        </th>
        {HEADER_MONTHS.map((month) => {
        let closeRow = findLowestDate('Dt2',data.filter(x => new Date(x.Dt).getMonth()==month.number-1));
        const monthData = closeRow ? (<span className='font-normal text-xs'>
          {new Date(closeRow.Dt2).toLocaleDateString('en-US', dateOptions2) }
          <br />{closeRow.Num2} {closeRow.Me2}
          <br />{closeRow.R2} BALL
          </span>)
          : "OPEN";
        return(
        <th colSpan="3" onClick={() => handleMonthClick(month.number)} key={month.name} scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          {month.name}<br />
          {monthData} 
        </th>
        )})}
      </tr>
    </thead>
    <tbody>
      {years.map((year, index) => (
        <tr key={'yr-'+year}>
          <td className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
            {year}
          </td>
          {HEADER_MONTHS.map((month) => {
            let closeRow = findLowestDate('Dt2',data.filter(x => new Date(x.Dt).getMonth()==month.number-1));
            //console.log('LowestDate.ROW', closeRow);
            let bgColor = 'bg-white'; //&& year >= new Date(closeRow['Dt']).getFullYear() && year <= new Date(closeRow['Dt2']).getFullYear()
            if(closeRow ){
              switch(closeRow['Q']){
                case "BOT": bgColor = 'bg-pink-400'; break;
                case "GRN": bgColor = 'bg-green-300'; break;
                case "BRN": bgColor = 'bg-amber-600'; break;
                case "FRG": bgColor = 'bg-red-400'; break;
                case "DBL": bgColor = 'bg-blue-400'; break;
                default: bgColor = 'bg-fuchsia-400'; //Q
              }
            }
            const filterData = removeDuplicates(['Num','Dt','Q'], data.filter(
              x => new Date(x.Dt).getFullYear()==year && new Date(x.Dt).getMonth()==month.number-1
            ));
            return(
            <>
            <td key={'td1-'+month.name+'-'+year} className={classNames('bg-white', 'border-b border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
              {filterData.map((x, i) => {
                let c = "";
                if(x.Dt == closeRow.Dt2) c="border-t-4 border-gray-900";
                if(x.Dt == closeRow.Dt) c="border-b-4 border-gray-900";
                return( 
                <span className={c} key={'span1-'+month.name+'-'+year+'-'+i}>
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
                if(x.Dt == closeRow.Dt2) c="border-t-4 border-gray-900";
                if(x.Dt == closeRow.Dt) c="border-b-4 border-gray-900";return( 
                <span className={c} key={'span3-'+month.name+'-'+year+'-'+i}>
                  {i !==0 && <br />}
                  {x.Q}&nbsp;
                  {new Date(x.Dt).toLocaleDateString('en-US', dateOptions)}
                </span> 
                )}
              )}
            </td>
            </>
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
        const bgColor = closeRow ? "bg-blue-700" : "bg-gray-500";
        return(
        <th colSpan="3" onClick={() => handleMonthClick(month.number)} key={month.name} scope="col" className="sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
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
