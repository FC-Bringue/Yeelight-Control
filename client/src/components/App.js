import { useState } from "react";
import axios from "axios";

import "../styles/App.css";

import logo from "../styles/logo.svg";

function App() {
  const [token, setToken] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const tokenGen = () => {
    return (
      Math.random().toString(36).substr(2) +
      Math.random().toString(36).substr(2)
    );
  };

  return (
    <div className="App">
      <div id="top_text">
        <img src={logo} alt="" />
        <h1>YEELIGHT CONTROL</h1>
      </div>

      <div id="middle_text">
        {token ? (
          <>
            <div>
              <p>
                Merci de laisser le programme en arrière-plan en minimisant
                l'application (ne pas cliquez sur la croix)
              </p>
              <img />
            </div>
            <div className="tkn_rslt">
              <p>Merci d'indiquer ce token dans l'application Moze :</p>
              <div
                className="hover"
                onClick={() => {
                  navigator.clipboard.writeText(token);
                  setIsCopied(true);
                  setTimeout(() => {
                    setIsCopied(false);
                  }, 2000);
                }}
              >
                <p>{token}</p>
              </div>
            </div>
          </>
        ) : (
          <div
            className="hover btn"
            onClick={async () => {
              let token = tokenGen();
              setToken(token);
              axios
                .post("/api/setToken", { token: token })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            <p>Génerer un token</p>
          </div>
        )}
      </div>
      {isCopied && <p className="copied">Copié !</p>}

      <div id="bottom_text">
        <p>Le service est bien en cours d'execution.</p>
        <p>MozeApp - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default App;
