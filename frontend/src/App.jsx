import { Outlet } from 'react-router-dom';
import './App.css'
import BurgerMenu from './components/BurgerMenu/BurgerMenu';
import {Link} from "react-router-dom";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer'

const App = () => {
  return (
    <div className='App'>
      <Header/>
      <BurgerMenu/>

      <div className='Content'>
        <Outlet/>
      </div>

      <Footer/>
    </div>
  )
}

export default App
