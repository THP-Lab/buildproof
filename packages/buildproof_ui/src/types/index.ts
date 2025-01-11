export * from './currency'
export * from './general'
export * from './quest'
export * from './transactions'

export enum UserRole {
  Developer = 'Developer',
  Sponsor = 'Sponsor',
  Judge = 'Judge',
  Admin = 'Admin',
}

export const USER_ROLE_HIERARCHY: UserRole[] = [
  UserRole.Developer,
  UserRole.Sponsor,
  UserRole.Judge,
  UserRole.Admin,
]

export function getHighestRole(roles: UserRole[]): UserRole | undefined {
  return roles.sort(
    (a, b) => USER_ROLE_HIERARCHY.indexOf(a) - USER_ROLE_HIERARCHY.indexOf(b),
  )[0]
}
