import { Switch, Input } from '@0xintuition/buildproof_ui';
import { SupportedCurrency } from './types';

interface CurrencyToggleProps {
    currency: SupportedCurrency;
    onToggle: () => void;
    ethAmount: string;
    setEthAmount: (value: string) => void;
    totalAbsoluteValue: number;
    resetAllSliders: () => void;
}

export const CurrencyToggle = ({ 
    currency, 
    onToggle, 
    ethAmount, 
    setEthAmount, 
    totalAbsoluteValue, 
    resetAllSliders 
}: CurrencyToggleProps) => {
    const handleInputChange = (value: string) => {
        if (currency === '$') {
            const [whole, decimal] = value.split('.');
            if (decimal && decimal.length > 2) {
                value = `${whole}.${decimal.slice(0, 2)}`;
            }
        }
        setEthAmount(value);
    };

    return (
        <div className="flex items-center gap-14">
            <div className="flex-shrink-0 flex items-center gap-2 border border-white/20 rounded-lg p-4 min-w-[400px]">
                <span className="text-sm text-white whitespace-nowrap">Your Total stakes<br />for this hackathon</span>
                <div className="w-[120px] flex-shrink-0">
                    <Input
                        type="number"
                        value={ethAmount}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="h-8 bg-transparent text-white border-white/20"
                        step={currency === '$' ? "0.01" : "0.001"}
                        min="0"
                    />
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                    <span className={`text-sm ${currency === 'ETH' ? 'text-primary font-bold' : 'text-white/60'}`}>ETH</span>
                    <Switch
                        checked={currency === '$'}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-accent mx-1"
                    />
                    <span className={`text-sm ${currency === '$' ? 'text-accent font-bold' : 'text-white/60'}`}>USD</span>
                </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-2 border border-white/20 rounded-lg p-4 min-w-[400px] min-h-[70px]">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-white whitespace-nowrap flex-shrink-0">Total Stakes placed</div>
                        <div className="text-sm text-white whitespace-nowrap flex-shrink-0">
                            {totalAbsoluteValue}/100%
                        </div>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-sm overflow-hidden flex-shrink-0">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${totalAbsoluteValue}%` }}
                        />
                    </div>
                </div>
                {totalAbsoluteValue > 0 && (
                    <button
                        onClick={resetAllSliders}
                        className="ml-2 p-1 rounded-full hover:bg-white/10 flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};