import { Button, Input } from '@0xintuition/buildproof_ui'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'

type VerifyResponse = {
  exists: boolean
  id?: string
  atoms?: {
    subject: string
    predicate: string
    object: string
  }
}

type VerifyResult = {
  data: VerifyResponse | null
  timestamp: number
}

export default function VerifyPage() {
  const fetcher = useFetcher<VerifyResponse>()
  const [atomValue, setAtomValue] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [predicateId, setPredicateId] = useState('')
  const [objectId, setObjectId] = useState('')
  const [hackathonTitle, setHackathonTitle] = useState('')

  const [atomResult, setAtomResult] = useState<VerifyResult>({ data: null, timestamp: 0 })
  const [tripleResult, setTripleResult] = useState<VerifyResult>({ data: null, timestamp: 0 })
  const [hackathonResult, setHackathonResult] = useState<VerifyResult>({ data: null, timestamp: 0 })

  useEffect(() => {
    if (fetcher.data && fetcher.formData) {
      const type = fetcher.formData.get('type') as string
      const result = { data: fetcher.data, timestamp: Date.now() }
      
      switch (type) {
        case 'atom':
          setAtomResult(result)
          break
        case 'triple':
          setTripleResult(result)
          break
        case 'hackathon':
          setHackathonResult(result)
          break
      }
    }
  }, [fetcher.data, fetcher.formData])

  const isResultValid = (timestamp: number) => {
    return Date.now() - timestamp < 5000
  }

  const handleVerifyAtom = () => {
    const formData = new FormData()
    formData.append('type', 'atom')
    formData.append('value', atomValue)
    
    fetcher.submit(formData, {
      method: 'post',
      action: '/resources/verify',
    })
  }

  const handleVerifyTriple = () => {
    const formData = new FormData()
    formData.append('type', 'triple')
    formData.append('subjectId', subjectId)
    formData.append('predicateId', predicateId)
    formData.append('objectId', objectId)
    
    fetcher.submit(formData, {
      method: 'post',
      action: '/resources/verify',
    })
  }

  const handleVerifyHackathon = () => {
    const formData = new FormData()
    formData.append('type', 'hackathon')
    formData.append('title', hackathonTitle)
    
    fetcher.submit(formData, {
      method: 'post',
      action: '/resources/verify',
    })
  }

  const isLoading = fetcher.state === 'submitting'

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Vérifier un Atom</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={atomValue}
            onChange={(e) => setAtomValue(e.target.value)}
            placeholder="String de l'atom"
            className="flex-1 p-2 border rounded text-black"
            disabled={isLoading}
          />
          <Button onClick={handleVerifyAtom} disabled={isLoading}>
            {isLoading && fetcher.formData?.get('type') === 'atom' ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
        {(isLoading && fetcher.formData?.get('type') === 'atom') ? (
          <div>Vérification en cours...</div>
        ) : (atomResult.data && isResultValid(atomResult.timestamp)) && (
          <div className="space-y-2 p-4 bg-gray-800 rounded-lg">
            <div className="text-lg">
              Résultat: <span className={atomResult.data.exists ? "text-green-500" : "text-red-500"}>
                {atomResult.data.exists ? 'Existe' : "N'existe pas"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Vérifier un Triple</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="ID du sujet"
            className="flex-1 p-2 border rounded text-black"
            disabled={isLoading}
          />
          <input
            type="text"
            value={predicateId}
            onChange={(e) => setPredicateId(e.target.value)}
            placeholder="ID du prédicat"
            className="flex-1 p-2 border rounded text-black"
            disabled={isLoading}
          />
          <input
            type="text"
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
            placeholder="ID de l'objet"
            className="flex-1 p-2 border rounded text-black"
            disabled={isLoading}
          />
          <Button onClick={handleVerifyTriple} disabled={isLoading}>
            {isLoading && fetcher.formData?.get('type') === 'triple' ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
        {(isLoading && fetcher.formData?.get('type') === 'triple') ? (
          <div>Vérification en cours...</div>
        ) : (tripleResult.data && isResultValid(tripleResult.timestamp)) && (
          <div className="space-y-2 p-4 bg-gray-800 rounded-lg">
            <div className="text-lg">
              Résultat: <span className={tripleResult.data.exists ? "text-green-500" : "text-red-500"}>
                {tripleResult.data.exists ? 'Existe' : "N'existe pas"}
              </span>
            </div>
            {tripleResult.data.exists && tripleResult.data.atoms && (
              <div className="mt-2 space-y-2">
                <div>ID: <span className="font-mono">{tripleResult.data.id}</span></div>
                <div>Sujet: <span className="font-mono break-all">{tripleResult.data.atoms.subject}</span></div>
                <div>Prédicat: <span className="font-mono">{tripleResult.data.atoms.predicate}</span></div>
                <div>Objet: <span className="font-mono break-all">{tripleResult.data.atoms.object}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Vérifier un Hackathon</h2>
        <div className="space-y-2">
          <Input
            type="text"
            value={hackathonTitle}
            onChange={(e) => setHackathonTitle(e.target.value)}
            placeholder="Titre du hackathon"
            className="w-full"
            disabled={isLoading}
          />
          <Button onClick={handleVerifyHackathon} disabled={isLoading}>
            {isLoading && fetcher.formData?.get('type') === 'hackathon' ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
        {(isLoading && fetcher.formData?.get('type') === 'hackathon') ? (
          <div>Vérification en cours...</div>
        ) : (hackathonResult.data && isResultValid(hackathonResult.timestamp)) && (
          <div className="space-y-2 p-4 bg-gray-800 rounded-lg">
            <div className="text-lg">
              Résultat: <span className={hackathonResult.data.exists ? "text-green-500" : "text-red-500"}>
                {hackathonResult.data.exists ? 'Existe' : "N'existe pas"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 