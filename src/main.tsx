import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import App1 from './App1.tsx'
import App2 from './App2.tsx'
import App3 from './App3.tsx'

// import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <br></br>
    <hr></hr>
    <App1 />
    <br></br>
    <hr></hr>
    <App2/>
    <br></br>
    <hr></hr>
    <App3/>
  </React.StrictMode>,
)
