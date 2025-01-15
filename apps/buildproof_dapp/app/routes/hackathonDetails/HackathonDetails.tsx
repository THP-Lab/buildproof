import React from 'react';
import {
  Text,
  Button,
  Icon,
  IconName,
} from '@0xintuition/buildproof_ui';

export function HackathonDetails() {
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

        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Partner Information
          </Text>
          <div className="space-y-4">
            <div>
              <Text variant="body" weight="medium" className="text-muted-foreground">
                Partner Name
              </Text>
              <Text variant="body">Example Partner</Text>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Hackathon Information
          </Text>
          <div className="space-y-4">
            <div>
              <Text variant="body" weight="medium" className="text-muted-foreground">
                Title
              </Text>
              <Text variant="body">Example Hackathon</Text>
            </div>

            <div>
              <Text variant="body" weight="medium" className="text-muted-foreground">
                Description
              </Text>
              <Text variant="body" className="whitespace-pre-wrap">
                Example description of the hackathon...
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text variant="body" weight="medium" className="text-muted-foreground">
                  Start Date
                </Text>
                <Text variant="body">2024-03-20</Text>
              </div>
              <div>
                <Text variant="body" weight="medium" className="text-muted-foreground">
                  End Date
                </Text>
                <Text variant="body">2024-04-20</Text>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-2">
            Prize Distribution
          </Text>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Text variant="body" weight="medium" className="text-muted-foreground">
                  Total Prize Pool
                </Text>
                <Text variant="h4" className="text-success">
                  $10,000
                </Text>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <Text variant="body" weight="medium">First Place</Text>
                <Text variant="body" className="text-success">$5,000</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <Text variant="body" weight="medium">Second Place</Text>
                <Text variant="body" className="text-success">$3,000</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <Text variant="body" weight="medium">Third Place</Text>
                <Text variant="body" className="text-success">$2,000</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 