const Navbar = ({ showHideSearch, showHideQueue }) => {
  return (
    <nav className='navbar'>
      <h1>DJRL | Play That!</h1>
      <div className='links'>
        <button onClick={() => showHideSearch()}>Show/Hide Search</button>
        <button onClick={() => showHideQueue()}>Show/Hide Queue</button>
      </div>
    </nav>
  );
};

export default Navbar;
