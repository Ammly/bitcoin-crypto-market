'use client';

interface Crypto {
  id: number;
  symbol: string;
  name: string;
}

interface CryptoSelectorProps {
  cryptoList: Crypto[];
  selectedCryptos: number[];
  onChange: (selected: number[]) => void;
}

export function CryptoSelector({ cryptoList, selectedCryptos, onChange }: CryptoSelectorProps) {
  const handleToggle = (cryptoId: number) => {
    if (selectedCryptos.includes(cryptoId)) {
      onChange(selectedCryptos.filter(id => id !== cryptoId));
    } else {
      onChange([...selectedCryptos, cryptoId]);
    }
  };

  const handleSelectAll = () => {
    onChange(cryptoList.map(c => c.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
        >
          Select All
        </button>
        <button
          onClick={handleClearAll}
          className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
        >
          Clear All
        </button>
        <span className="ml-auto text-sm text-gray-600">
          {selectedCryptos.length} selected
        </span>
      </div>
      
      <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
        {cryptoList.map(crypto => (
          <label
            key={crypto.id}
            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCryptos.includes(crypto.id)}
              onChange={() => handleToggle(crypto.id)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <div className="font-medium text-sm">{crypto.name}</div>
              <div className="text-xs text-gray-500">{crypto.symbol}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
