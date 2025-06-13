import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">ForumApp</h1>
          <div className="space-x-4">
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </nav>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Welcome to ForumApp!</h2>
      <p className="text-gray-600">Create an account or log in to start posting.</p>
    </div>
  );
}

export default App;
