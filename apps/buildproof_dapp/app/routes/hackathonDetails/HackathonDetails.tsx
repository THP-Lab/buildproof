import React from 'react';
import {
  Text,
  Button,
  Icon,
  IconName,
} from '@0xintuition/buildproof_ui';
import rawCsvData from '../../assets/data/ethglobal_prizes_clean.csv?raw';

interface PrizeData {
  event_url: string;
  partner_name: string;
  total_partner_amount: number;
  prize_title: string;
  prize_amount: number;
  description: string;
  prize_breakdown: string;
}

export function HackathonDetails() {
  const [prizes, setPrizes] = React.useState<PrizeData[]>([]);

  React.useEffect(() => {
    // Parse CSV data when component mounts
    const parsedData = rawCsvData
      .split('\n')
      .slice(1) // Skip header row
      .filter(line => line.trim() !== '')
      .map(line => {
        // Use a more robust CSV parsing approach
        let values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let char of line) {
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const [event_url, partner_name, total_partner_amount, prize_title, prize_amount, description, prize_breakdown] = values;

        // Format prize breakdown to ensure proper number formatting
        let formattedPrizeBreakdown = prize_breakdown;
        if (prize_breakdown !== 'N/A') {
          formattedPrizeBreakdown = prize_breakdown
            .replace(/"/g, '')
            .replace(/\$(\d+),?(\d+)?/g, (match, p1, p2) => {
              const amount = p2 ? `${p1}${p2}` : p1;
              return `$${Number(amount).toLocaleString()}`;
            });
        }

        return {
          event_url,
          partner_name,
          total_partner_amount: Number(total_partner_amount),
          prize_title,
          prize_amount: Number(prize_amount),
          description: description === 'N/A' ? '' : description,
          prize_breakdown: formattedPrizeBreakdown === 'N/A' ? '' : formattedPrizeBreakdown,
        };
      });

    setPrizes(parsedData);
  }, []);

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Text variant="h1" className="font-bold">
            Hackathon Details
          </Text>
          <Button variant="outline" size="sm">
            <Icon name={IconName.arrowLeft} className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>

        {/* Prize Distribution */}
        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Prize Distribution
          </Text>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {prizes.map((prize, index) => (
                <div key={index} className="p-6 bg-muted rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Event Name */}
                  <Text variant="small" className="text-muted-foreground mb-2">
                    {prize.event_url.split('/').pop()}
                  </Text>

                  {/* Header: Partner Name and Prize Amount */}
                  <div className="flex justify-between items-start mb-4">
                    <Text variant="h4" weight="semibold" className="text-primary">
                      {prize.partner_name}
                    </Text>
                    <Text variant="h4" className="text-success font-mono">
                      ${prize.prize_amount.toLocaleString()}
                    </Text>
                  </div>

                  {/* Prize Title or Description */}
                  <Text variant="body" className="mb-3 text-foreground">
                    {prize.prize_title || prize.description || 'No description available'}
                  </Text>

                  {/* Prize Breakdown */}
                  {prize.prize_breakdown && (
                    <div className="mt-4 space-y-2">
                      <Text variant="small" weight="medium" className="text-muted-foreground mb-2">
                        Prize Distribution:
                      </Text>
                      {prize.prize_breakdown.split('|').map((breakdown, idx) => {
                        const cleanBreakdown = breakdown.trim();
                        if (!cleanBreakdown) return null;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary opacity-75" />
                            <Text variant="small" className="text-muted-foreground">
                              {cleanBreakdown}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Prize Pool */}
        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Total Prize Pool
          </Text>
          <Text variant="h4" className="text-success">
            ${prizes.reduce((sum, prize) => sum + prize.prize_amount, 0).toLocaleString()}
          </Text>
        </div>
      </div>
    </div>
  );
} 