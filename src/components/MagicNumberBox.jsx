import { useState, useEffect } from 'react';

import Input from './Input.jsx';

export default function MagicNumberBox({ onNumberChange, children, ...props }) {
    const [number1, setNumber1] = useState(0);
    useEffect(() => {
      const storedValue = localStorage.getItem('magic-number');
      if (storedValue) {
        setNumber1(storedValue);
        onNumberChange(storedValue);
      }
      // Cleanup function to remove event listener or other side effects
      return () => {
        // Any cleanup code here
      };
    }, []);
    
    function handleNumber1Change(value) {
      setNumber1(value);
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') { handleGoClick(); }
    };
    function handleGoClick(){
      localStorage.setItem('magic-number', number1);
      onNumberChange(number1);
    }
    return (
        <div
          id="auth-inputs"
          className="mb-2 flex flex-wrap gap-2 w-fit max-w-sm p-4 mx-auto rounded shadow-md bg-gradient-to-b from-stone-500 to-stone-800"
        >
          <div className="w-20">
            <input className='w-full px-3 py-2 leading-tight border rounded shadow text-gray-700 bg-stone-100' 
              type="number" min="0" max="999" 
              value={number1} onKeyDown={handleKeyDown}
              onChange={(event) => handleNumber1Change(event.target.value)} />
          </div>
          <div className="">
            <button onClick={handleGoClick} className="px-4 py-2 font-semibold uppercase rounded text-stone-900 bg-amber-400 hover:bg-amber-500">
              GO
            </button>
          </div>
        </div>
      );
  }
  