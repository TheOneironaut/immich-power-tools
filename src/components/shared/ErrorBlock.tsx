import React from 'react'

interface ErrorBlockProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;   
  action?: React.ReactNode;
}
export default function ErrorBlock(
  { icon, title, description, action }: ErrorBlockProps
) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4 py-10">
      {icon}
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-gray-500">{description}</p>}
      {action || null}
    </div>
  )
}
