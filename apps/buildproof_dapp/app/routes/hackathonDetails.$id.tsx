import { useParams } from '@remix-run/react';
import { HackathonInfos } from './hackathonDetails/BasicHackathonInfos';

export default function HackathonDetails() {
  const { id } = useParams();
  
  if (!id) {
    return <div>Hackathon not found</div>;
  }

  return <HackathonInfos atomId={parseInt(id)} />;
} 