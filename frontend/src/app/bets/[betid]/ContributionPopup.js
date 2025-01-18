import React, { useState } from 'react';

const BettingPopup = ({ 
  onSubmit, 
  onClose, 
  poolTotal = 0,
  rewardType = 'units',
  quickBets = [5, 10, 20, 50],
  betType = 'many_to_many' // New prop to determine button layout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [position, setPosition] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit({ 
      amount: Number(amount), 
      position: betType === 'many_to_many' ? position : 'contribute'
    });
    setAmount('');
    setPosition(null);
    setIsOpen(false);
  };

  const renderTriggerButton = () => {
    if (betType === 'one_to_many') {
      // Render a single "Contribute" button for 'one_to_many'
      return (
        <button
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => {
            setPosition('contribute');
            setIsOpen(true);
          }}
        >
          Contribute
        </button>
      );
    }
  
    // Render "Yes" and "No" buttons for 'many_to_many'
    return (
      <div className="flex gap-2">
        <button
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => {
            setPosition('yes');
            setIsOpen(true);
          }}
        >
          Yes
        </button>
        <button
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
          onClick={() => {
            setPosition('no');
            setIsOpen(true);
          }}
        >
          No
        </button>
      </div>
    );
  };
  

  return (
    <div className="relative">
      {renderTriggerButton()}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-gray-900 text-white p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {betType === 'one_to_many' ? 'Contribute' : `Place your bet: ${position === 'yes' ? 'Yes' : 'No'}`}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {betType === 'one_to_many' ? 'Contribution Amount' : 'Bet Amount'} ({rewardType})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickBets.map((bet) => (
                    <button
                      key={bet}
                      type="button"
                      onClick={() => setAmount(bet)}
                      className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {bet}
                    </button>
                  ))}
                </div>
              </div>

              {poolTotal > 0 && (
                <div className="text-sm text-gray-400">
                  Current pool: {poolTotal} {rewardType}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  betType === 'one_to_many'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : position === 'yes'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {betType === 'one_to_many' 
                  ? `Contribute ${amount || '0'} ${rewardType}`
                  : `Place ${amount || '0'} ${rewardType} on ${position === 'yes' ? 'Yes' : 'No'}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingPopup;