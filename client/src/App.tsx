import "./App.css";
import UrlShortener from "./component/UrlShortener";

function App(): JSX.Element {
  return (
    <div className="app">
      <div className="app-inner">
        <UrlShortener />
      </div>
      <footer className="copyright">
        ByteURL by <a target="_blank" rel="noopener noreferrer" href="https://mrzahidxy.vercel.app/">Zahid</a>
      </footer>
    </div>
  );
}

export default App;
