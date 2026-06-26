interface P {
  className?: string
}
const s = (className?: string) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
})

export const IconDashboard = ({ className }: P) => (
  <svg {...s(className)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
)
export const IconList = ({ className }: P) => (
  <svg {...s(className)}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3.5" cy="6" r="1" fill="currentColor" /><circle cx="3.5" cy="12" r="1" fill="currentColor" /><circle cx="3.5" cy="18" r="1" fill="currentColor" /></svg>
)
export const IconBoard = ({ className }: P) => (
  <svg {...s(className)}><rect x="3" y="3" width="5" height="18" rx="1.5" /><rect x="9.5" y="3" width="5" height="12" rx="1.5" /><rect x="16" y="3" width="5" height="15" rx="1.5" /></svg>
)
export const IconUsers = ({ className }: P) => (
  <svg {...s(className)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
export const IconPlus = ({ className }: P) => (
  <svg {...s(className)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
)
export const IconSearch = ({ className }: P) => (
  <svg {...s(className)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
)
export const IconExternal = ({ className }: P) => (
  <svg {...s(className)}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
)
export const IconTrash = ({ className }: P) => (
  <svg {...s(className)}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
)
export const IconX = ({ className }: P) => (
  <svg {...s(className)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)
export const IconCheck = ({ className }: P) => (
  <svg {...s(className)}><polyline points="20 6 9 17 4 12" /></svg>
)
export const IconBolt = ({ className }: P) => (
  <svg {...s(className)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
)
export const IconBuilding = ({ className }: P) => (
  <svg {...s(className)}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="7" x2="9" y2="7" /><line x1="15" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="9" y2="11" /><line x1="15" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
)
export const IconTrend = ({ className }: P) => (
  <svg {...s(className)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
)
export const IconTarget = ({ className }: P) => (
  <svg {...s(className)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
)
export const IconLink = ({ className }: P) => (
  <svg {...s(className)}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
)
