import clsx from 'clsx'

const gradeConfig = {
  A: { bg: 'bg-green-500/15',  border: 'border-green-500/40',  text: 'text-green-400'  },
  B: { bg: 'bg-teal-500/15',   border: 'border-teal-500/40',   text: 'text-teal-400'   },
  C: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400' },
  D: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400' },
  F: { bg: 'bg-red-500/15',    border: 'border-red-500/40',    text: 'text-red-400'    },
}

export default function GradeBadge({ grade, size = 'md' }) {
  const cfg = gradeConfig[grade] || gradeConfig.F
  const sizes = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-10 h-10 text-base font-bold',
    lg: 'w-16 h-16 text-2xl font-bold',
    xl: 'w-24 h-24 text-4xl font-bold',
  }
  return (
    <div className={clsx(
      'rounded-full border-2 flex items-center justify-center font-display',
      cfg.bg, cfg.border, cfg.text, sizes[size]
    )}>
      {grade}
    </div>
  )
}
