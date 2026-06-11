export function formatAge(birthDate: string, now = new Date()): string {
  const birth = new Date(birthDate)
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years <= 0) return `${Math.max(months, 0)}m`
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`
}
