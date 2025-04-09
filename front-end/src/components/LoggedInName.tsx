function LoggedInName() {

  let _ud = localStorage.getItem('user_data');
  if (_ud == null) _ud = "";
  const ud = JSON.parse(_ud);
  const userId = ud.id;
  const firstName = ud.firstName;
  const lastName = ud.lastName;

  function doLogout(event: any): void {
    event.preventDefault();

    localStorage.removeItem("user_data")
    window.location.href = '/';

  };

  return (
    <div id="loggedInDiv">
      <span id="userName">Logged In As {firstName} {lastName}</span><br />
      <button type="button" id="logoutButton" className="buttons"
        onClick={doLogout}> Log Out </button>
    </div>
  );

};
export default LoggedInName;
