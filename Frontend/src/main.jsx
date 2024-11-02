import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Home  from './component/Home.jsx'
import SignUp from './component/SignUp.jsx'
import LogIn  from './component/LogIn.jsx'
import Ticket from './component/Ticket.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import {supportInfoLoader} from './component/Ticket.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App/>}>
      <Route path='' element={<Home/>}></Route>
      <Route path='signUp' element={<SignUp/>}></Route>
      <Route path='logIn' element={<LogIn/>}></Route>
      <Route loader={supportInfoLoader} path='ticket' element={<Ticket/>}></Route>
       <Route path='*' element={<div>Not Found</div>}>
       </Route>

    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router} />
  </StrictMode>,
)
