
const Header = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span style={{fontSize:'1.5rem'}}>🛡️</span> KaggleGuard AI
      </div>
      <div className="header-user">
        <span>Demo Merchant</span>
        <div className="user-avatar">DM</div>
      </div>
    </header>
  );
};

export default Header;