import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../util/http.js';
import LoadingIndicator from './UI/LoadingIndicator.jsx';
import ErrorBlock from './UI/ErrorBlock.jsx';
import { HEADER_MONTHS, classNames, DATE_OPT_MDY4 } from './UI/constants';

export default function PanelOpen({ state, dt, onPanelClick }) {
    const openUrl = import.meta.env.VITE_URL_OPENP+'&state='+state+'&date='+dt.toLocaleDateString('en-US', DATE_OPT_MDY4);
    const { data, isPending, isError, error } = useQuery({
      queryKey: [state, 'panel-open', dt],
      queryFn: ({ signal }) => fetchData({ signal, url: openUrl }),
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
        resultsTable = <table className="min-w-full border-separate border-spacing-0">
        <thead>
        <tr>
            {HEADER_MONTHS.map((month) => {
            return(
            <th key={"panelopen-header-"+month.number} scope="col" className={classNames(month.number==1 ? "rounded-tl-lg" : month.number==12 ? "rounded-tr-lg" : "", "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center items-center justify-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
            {month.name}
            </th>
            )})}
        </tr>
        </thead>
        <tbody>
        <tr>
            {HEADER_MONTHS.map((month) => {
            return(
            <td key={'panelopen-td-'+month.number} className="align-top bg-white border-b border-l border-gray-200 py-1 pl-1 pr-1 text-xs font-bold text-gray-900 sm:pl-1 lg:pl-1">
                <div className="grid grid-cols-1 place-items-center">
                {data.filter(d => d.Mo == month.number).map(x => (
                    <div key={'panelopen-item-'+month.number+x.Pnum} onClick={() => onPanelClick(x.Pnum)} className="bg-gray-800 mb-1 w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                    {x.Pnum}</div>
                ))}
                </div>
            </td>
            )})}
        </tr>
        </tbody>
        <tfoot>
        <tr>
            {HEADER_MONTHS.map((month) => {
            return(
            <th key={'tfooter-th-'+month.name} scope="col" className={classNames(month.number==1 ? "rounded-bl-lg" : month.number==12 ? "rounded-br-lg" : "", "sticky bottom-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-center text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter")}>
            <div className='grid place-items-center'>
                <div className="bg-red-600 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md">
                {data.filter(d => d.Mo == month.number).length}
                </div>
                {month.nam}
            </div>
            </th>
            )})}
        </tr>
        </tfoot>
        </table>;
    }

    return resultsTable;
}