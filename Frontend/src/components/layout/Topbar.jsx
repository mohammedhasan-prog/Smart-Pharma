function Topbar({
  searchPlaceholder = 'Search inventory...',
  searchValue,
  onSearchChange,
}) {
  const searchInputProps = onSearchChange
    ? {
        value: searchValue ?? '',
        onChange: (event) => onSearchChange(event.target.value),
      }
    : {}

  return (
    <header className="dashboard-topbar">
      <nav className="topbar-links" aria-label="Top menu">
        <button type="button" className="topbar-link active">
          Reports
        </button>
        <button type="button" className="topbar-link">
          Analytics
        </button>
      </nav>

      <div className="topbar-tools">
        <label className="topbar-search" htmlFor="globalSearch">
          <span className="material-symbols-outlined">search</span>
          <input id="globalSearch" type="text" placeholder={searchPlaceholder} {...searchInputProps} />
        </label>

        <button type="button" className="icon-button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button type="button" className="icon-button" aria-label="Help">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <button type="button" className="role-switcher">
          Role Switcher
          <span className="material-symbols-outlined">swap_horiz</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar
