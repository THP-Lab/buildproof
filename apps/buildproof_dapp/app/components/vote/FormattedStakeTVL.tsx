import { StakeTVL, CurrencyType } from '@0xintuition/buildproof_ui';

interface FormattedStakeTVLProps {
    totalTVL: number;
    tvlFor: number;
    tvlAgainst: number;
    currency?: CurrencyType;
    numPositionsFor?: number;
    numPositionsAgainst?: number;
}

const formatTVL = (value: number) => {
    return value < 0.0001 ? 0.0001 : Number(value.toFixed(4));
};

export const FormattedStakeTVL = ({
    totalTVL,
    tvlFor,
    tvlAgainst,
    currency = 'ETH',
    numPositionsFor,
    numPositionsAgainst,
}: FormattedStakeTVLProps) => {
    return (
        <StakeTVL
            totalTVL={formatTVL(totalTVL)}
            tvlFor={formatTVL(tvlFor)}
            tvlAgainst={formatTVL(tvlAgainst)}
            currency={currency}
            isClaim={true}
            numPositionsFor={numPositionsFor}
            numPositionsAgainst={numPositionsAgainst}
        />
    );
}; 