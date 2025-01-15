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
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [prizes, setPrizes] = React.useState<PrizeData[]>([]);
  const [events, setEvents] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Parse CSV data and extract unique events when component mounts
    const lines = rawCsvData.split('\n').filter(line => line.trim());
    const uniqueEvents = Array.from(new Set(
      lines.slice(1) // Skip header
        .map(line => line.split(',')[0])
        .filter(Boolean)
    ));
    setEvents(uniqueEvents);
  }, []);

  React.useEffect(() => {
    if (!selectedEvent) return;

    // Parse CSV data when event is selected
    const parsedData = rawCsvData
      .split('\n')
      .slice(1) // Skip header row
      .filter(line => line.trim() !== '')
      .map(line => {
        const [event_url, partner_name, total_partner_amount, prize_title, prize_amount, description, prize_breakdown] = line.split(',');
        return {
          event_url,
          partner_name,
          total_partner_amount: Number(total_partner_amount),
          prize_title,
          prize_amount: Number(prize_amount),
          description: description === 'N/A' ? '' : description,
          prize_breakdown: prize_breakdown === 'N/A' ? '' : prize_breakdown,
        };
      });

    // Filter prizes for selected event
    const eventPrizes = parsedData.filter(prize => prize.event_url === selectedEvent);
    setPrizes(eventPrizes);
  }, [selectedEvent]);

  const formatEventName = (url: string) => {
    const eventName = url.split('/').pop() || '';
    return eventName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim();
  };

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

        {/* Event Selection */}
        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Select Event
          </Text>
          <select
            className="form-select theme-border rounded-md p-2 bg-background text-foreground hover:cursor-pointer"
            onChange={(e) => setSelectedEvent(e.target.value)}
            value={selectedEvent || ''}
          >
            <option value="" className="text-muted-foreground">Select an event...</option>
            {events.map((eventUrl) => (
              <option key={eventUrl} value={eventUrl} className="text-foreground">
                {formatEventName(eventUrl)}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && prizes.length > 0 && (
          <>
            {/* Prize Distribution */}
            <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
              <Text variant="h3" weight="semibold" className="mb-2">
                Prize Distribution
              </Text>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {prizes.map((prize, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Text variant="body" weight="medium">
                            {prize.partner_name}
                          </Text>
                          <Text variant="body" className="text-muted-foreground">
                            {prize.prize_title}
                          </Text>
                        </div>
                        <Text variant="h4" className="text-success">
                          ${prize.prize_amount.toLocaleString()}
                        </Text>
                      </div>
                      {prize.prize_breakdown && (
                        <Text variant="small" className="text-muted-foreground">
                          {prize.prize_breakdown}
                        </Text>
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
          </>
        )}
      </div>
    </div>
  );
} 