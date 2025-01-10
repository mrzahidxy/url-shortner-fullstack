import "./App.css";
import UrlShortener from "./component/UrlShortener";

function App() {
  return (
    <div className="app">
      <UrlShortener />
      <div className="copyright">
        URL Shortner by{" "}
        <a href="https://www.linkedin.com/in/mrzahidxy/">Zahid</a>
      </div>
    </div>
  );
}

export default App;
