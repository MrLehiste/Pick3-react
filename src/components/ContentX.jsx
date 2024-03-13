import React, { useState, useEffect } from 'react';

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
const INIT_ARRAYS = Array.from({ length: 12 }, () => []);
  
  export default function ContentX({state, num}) {
    const [years, setYears] = useState(INIT_YEARS);
    const [xData, setXData] = useState(INIT_ARRAYS);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(()=>{
      let y = [];
      for (let year = new Date().getFullYear(); year >= 1988; year--) { y.push(year); }
      setYears(y);
    }, []);

    useEffect(() => {
      for (let i = 1; i <= 12; i++) {
        const panelUrl = 'https://pick3-function-api.azurewebsites.net/api/Panel?month='+i.toString()+'&state='+state+'&num='+num+'&code=jObvEG0duLEYTPf4ig4D0q6CiCicMZZJeDHbnamUnKsSTVGuj2FVLw==';
        //console.log('Fetching', panelUrl);
        fetch(panelUrl)
          .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok.'); }
            return response.json();
          })
          .then(data => {
            setXData(prevX => prevX.map((item, index) => index === i - 1 ? data : item));
            //console.log('setXData()', i);
            setRetryCount(0);
          })
          .catch(error => {
            console.error('There was a problem fetching the data:', error);
            if(retryCount <= 3) {
              setTimeout(() => {
                setRetryCount(retryCount + 1);
              }, 5000);
            }
            else {
              console.log('retry data failed'); 
            }
          });
      }
    }, []); 
    // useEffect(() => console.log('xData changed',xData), [xData]);

    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };

    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

    return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-0 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle grid">
            <table className="min-w-full border-separate border-spacing-0">
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
                    <td key={'td-'+month.name+'-'+year} className='border-b border-gray-200 bg-white whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'>
                      {xData[month.number-1] && xData[month.number-1].filter(x => new Date(x.Dt).getFullYear()==year).map(
                        (x, i) => {return( <span key={'span-'+month.name+'-'+year+'-'+i}>
                          {i !==0 && <br />}{x.Num}
                        </span> )}
                      )}
                    </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
  