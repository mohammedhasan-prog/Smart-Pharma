function AuthInput({
  id,
  label,
  type = 'text',
  icon,
  placeholder,
  value,
  onChange,
  rightElement,
  error,
  required = true,
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <div className={error ? 'auth-input-shell auth-input-shell-error' : 'auth-input-shell'}>
        <span className="material-symbols-outlined">{icon}</span>
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} />
        {rightElement}
      </div>
      {error ? <small className="auth-field-error">{error}</small> : null}
    </label>
  )
}

export default AuthInput
