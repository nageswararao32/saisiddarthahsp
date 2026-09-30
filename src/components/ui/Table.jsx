import clsx from 'clsx'

export default function Table({ columns, rows, keyField = 'id', emptyLabel = 'No records found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-left font-medium text-ink-400 uppercase tracking-wide text-[11px] py-3 px-4 first:pl-0 last:pr-0',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-ink-400 text-sm">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('py-3.5 px-4 first:pl-0 last:pr-0 text-ink-700', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
