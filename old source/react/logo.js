const e = React.createElement;

class Logo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <img src="images/smumLogo.png" width="31" height="42" alt="SMUM" />
        <span>&nbsp;&nbsp;Santa Maria Urban Ministry</span>
      </div>
    );
  }
}
const domContainer = document.querySelector('.logo');
ReactDOM.render(e(Logo), domContainer);
