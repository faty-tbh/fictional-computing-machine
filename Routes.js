import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Acc from './components/Acc/acc';
import Login from './components/Login/login';
import Forgot from './components/Forgot/forgot';
import SignUp from './components/Signup/signup';
import Principal from './components/Principal/principal';
import Chatbot from './components/Chatbot/chatbot';
import Resto from './components/Resto/resto';
import Ing from './components/Ing/ing';


function App() {
 return (
    <BrowserRouter>
      <div className="App">
        <nav>
          {/* your navigation links here */}
        </nav>
        <Routes>
          <Route path="/" element={<Acc />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/principal/:email" element={<Principal/>} />
          <Route path="/chatbot" element={<Chatbot/>}/>
          <Route path="/resto" element={<Resto/>}/>
          <Route path="/ing" element={<Ing/>}/> 
        </Routes>
      </div>
    </BrowserRouter>
 );
}

export default App;