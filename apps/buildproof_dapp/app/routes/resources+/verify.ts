import {
  verifyAtom,
  verifyHackathon,
  verifyTriple,
} from '@lib/utils/verify-blockchain'
import { json } from '@remix-run/node'

export async function action({ request }: { request: Request }) {
  const formData = await request.formData()
  const type = formData.get('type') as string

  switch (type) {
    case 'atom': {
      const value = formData.get('value') as string
      return json({
        exists: await verifyAtom(value),
      })
    }

    case 'triple': {
      const subjectId = formData.get('subjectId') as string
      const predicateId = formData.get('predicateId') as string
      const objectId = formData.get('objectId') as string

      return json(
        await verifyTriple(
          BigInt(subjectId),
          BigInt(predicateId),
          BigInt(objectId),
        ),
      )
    }

    case 'hackathon': {
      const title = formData.get('title') as string
      return json(await verifyHackathon(title))
    }

    default:
      throw new Error('Type de vérification invalide')
  }
}
