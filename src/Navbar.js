const Navbar = ({ showHideSearch, showHideQueue }) => {
  return (
    <nav className='navbar'>
      <h1>DJRL | Play That!</h1>
      <div className='links'>
        <button onClick={() => showHideSearch()}>🔎</button>
        <button onClick={() => showHideQueue()}>🎶</button>
      </div>
    </nav>
  );
};

export default Navbar;
