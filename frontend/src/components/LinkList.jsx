import React from 'react'
import LinkCard from './LinkCard'

export default function LinkList({ links, onDelete }) {
  if (!links || links.length === 0) return <div className="mt-6 text-center text-slate-500">No links saved yet.</div>
  return (
    <div className="mt-6 grid gap-4">
      {links.map(link => (
        <LinkCard key={link._id} link={link} onDelete={onDelete} />
      ))}
    </div>
  )
}
