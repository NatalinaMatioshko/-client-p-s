export function Container({ className = '', as: As = 'div', children, ...props }) {
  return (
    <As className={`container ${className}`.trim()} {...props}>
      {children}
    </As>
  )
}
