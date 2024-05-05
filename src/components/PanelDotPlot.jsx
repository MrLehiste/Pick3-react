import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import { HEADER_MONTHS, classNames, DAYS_31 } from './UI/constants';

export default function PanelDotPlot({ state, num }) {
  const panelUrl = import.meta.env.VITE_URL_PANEL+'&state='+state+'&num='+num;
  const { data, isPending, isError, error } = useQuery({
    queryKey: [state, num, 'panel'],
    queryFn: ({ signal }) => fetchData({ signal, url: panelUrl }),
    staleTime: 1000 * 60 * 60 * 12, //12 hours 
    cacheTime: 1000 * 60 * 60 * 12, //12 hours 
  });

  let panelContent;
  if (isPending) { panelContent = <LoadingIndicator />; }
  if (isError) {
    panelContent = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch tablet data.'} />
    );
  }
  if (data) {
    const DATA_MONTHS = HEADER_MONTHS.map(month => ({
      ...month,
      closed: data.filter(x => new Date(x.Dt).getMonth()==month.number-1).length ==
      new Set(data.filter(x => new Date(x.Dt).getMonth()==month.number-1).map(d => new Date(d.Dt).getDate())).size 
      ? false : true, // Conditional field
    }));
    panelContent = (<table className="min-w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th scope="col" className="rounded-tl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
        {/* {JSON.stringify( DATA_MONTHS )} */}
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
      {DAYS_31.map((d) => (
        <tr key={'pdot-tr-'+d}>
          <td className='sticky left-0 z-11 border-b border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
            {d}
          </td>
          {DATA_MONTHS.map((month) => {
            return(
            <td key={'pdot-td-'+month.name+'-'+d} className={classNames('bg-white', 'border-b border-l border-gray-200 whitespace-nowrap py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1')}>
              <span className="flex items-center">
                {data.filter(x => new Date(x.Dt).getDate()==d && new Date(x.Dt).getMonth()==month.number-1)
                .map((x, i) => (
                  i == 0 ? <span key={'pdot-span-'+month.name+d+x.Dtm+i} className={classNames(month.closed ? "bg-blue-800" : "bg-red-600", "mr-1 text-white w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs shadow-md")}>
                  {d} 
                  </span> 
                  : <span key={'pdot-span-'+month.name+d+x.Dtm+i} className='text-sm'>x</span> 
                ))}
              </span>
            </td>
          )})}
          <td className='border-b border-l border-gray-200 bg-white whitespace-nowrap py-1 pl-3 pr-3 text-sm font-medium text-gray-900 sm:pl-3 lg:pl-3'>
          <div className='grid place-items-center'>
            <div className="bg-gray-800 w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-base shadow-md">
              {data.filter(x => new Date(x.Dt).getDate()==d).length}
            </div>
          </div>
          </td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <th scope="col" className="rounded-bl-lg sticky top-0 left-0 z-9 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          &nbsp;</th>
        {DATA_MONTHS.map((month) => {
        return(
        <th key={'tfooter-th-'+month.name} scope="col" className="sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
          <div className='grid place-items-center'>
            <div className={classNames(month.closed ? "bg-gray-800" : "bg-red-600", "w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md")}>
              {data.filter(x => new Date(x.Dt).getMonth()==month.number-1).length}
            </div>
            {month.nam}
          </div>
        </th>
        )})}
        <th scope="col" className="rounded-br-lg sticky bottom-0 right-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-8 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">
          <div className='grid place-items-center'>
            <div className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
              {data.length}
            </div>
            TOTAL
          </div>
        </th>
      </tr>
    </tfoot>
    </table>);
  }

  return panelContent;
}
