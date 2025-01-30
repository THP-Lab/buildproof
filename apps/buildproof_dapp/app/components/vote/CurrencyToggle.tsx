import { Switch } from '@0xintuition/buildproof_ui';
import { SupportedCurrency } from './types';

interface CurrencyToggleProps {
    currency: SupportedCurrency;
    onToggle: () => void;
}

export const CurrencyToggle = ({ currency, onToggle }: CurrencyToggleProps) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-white">ETH</span>
            <Switch
                checked={currency === 'USDC'}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-accent"
            />
            <span className="text-sm text-white">USDC</span>
        </div>
    );
};