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

export default function ContentX({state, num}) {
  const dateOptions = { month: 'numeric', day: 'numeric' }; //, year: 'numeric'
  function classNames(...classes) { return classes.filter(Boolean).join(' '); }
  const [years, setYears] = useState(INIT_YEARS);
  useEffect(()=>{
    let y = [];
    for (let year = new Date().getFullYear(); year >= 1988; year--) { y.push(year); }
    setYears(y);
  }, []);

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
  if (data) {
    content = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          Year
        </th>
        {HEADER_MONTHS.map((month) => (
        <th key={month.name} scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          {month.name}
        </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {years.map((year, index) => (
        <tr key={'yr-'+year}>
          <td className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'>
            {year}
          </td>
          {HEADER_MONTHS.map((month) => (
          <td key={'td-'+month.name+'-'+year} className='border-b border-gray-200 bg-white whitespace-nowrap py-2 pl-2 pr-1 text-xs font-normal text-gray-900 sm:pl-3 lg:pl-4'>
            {data.filter(
              x => new Date(x.Dt).getFullYear()==year && new Date(x.Dt).getMonth()==month.number-1
            ).map(
              (x, i) => {return( <span key={'span-'+month.name+'-'+year+'-'+i}>
                {i !==0 && <br />}
                <strong>{x.Num}</strong>&nbsp;
                {x.Q}&nbsp;
                {new Date(x.Dt).toLocaleDateString('en-US', dateOptions)}
              </span> )}
            )}
          </td>
          ))}
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
          {content}
        </div>
      </div>
    </div>
  </div>
)
}
