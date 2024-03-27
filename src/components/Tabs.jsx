import React from 'react';

const TAB_LIST = [
    { name: 'Sheet', href: '#', current: false },
    { name: 'Magic', href: '#', current: false },
    { name: 'Tablet', href: '#', current: false },
    { name: 'Panel', href: '#', current: true },
    { name: 'Scramble', href: '#', current: false },
    { name: 'Picks', href: '#', current: false },
  ]
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  export default function Tabs({ onTabChange, selectedTab }) {
    const handleTabChange = (event) => {
        onTabChange(event.target.value);
    };
    const handleTabClick = (event) => {
        onTabChange(event.target.textContent);
        event.preventDefault();
    };
    return (
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            defaultValue={selectedTab}
            onChange={handleTabChange}
          >
            {TAB_LIST.map((tab) => (
              <option key={tab.name} value={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {TAB_LIST.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  (tab.name == selectedTab) ? 'text-gray-800 bg-white' : 'text-gray-600 hover:text-gray-800',
                  'rounded-md px-3 py-2 text-sm font-medium'
                )}
                aria-current={(tab.name == selectedTab) ? 'page' : undefined}
                onClick={handleTabClick}
              >{tab.name}</a>
            ))}
          </nav>
        </div>
        <div className='bg-indigo-500 pt-1'></div>
      </div>
    )
  }
  