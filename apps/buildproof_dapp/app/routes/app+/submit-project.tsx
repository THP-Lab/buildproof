import { ProjectSubmission } from '../../pages/ProjectSubmission'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

export default function SubmitProject() {
  const { authenticated, ready } = usePrivy()
  const navigate = useNavigate()

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login?redirectTo=/app/submit-project')
    }
  }, [ready, authenticated, navigate])

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return <ProjectSubmission />
} 