
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { api } from '../services/api';
import { Button, Input } from '../components/ui';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = await api.login(email, password);
    if (user) {
      setUser(user);
      navigate('/schedule');
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-orange-800 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border border-white/10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <img 
            src="https://shtilim.org/wp-content/uploads/2023/01/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%9C%D7%90-%D7%A8%D7%A7%D7%A2-%D7%A9%D7%91%D7%99%D7%9C%D7%99-%D7%94%D7%AA%D7%95%D7%A8%D7%94-1536x606.png" 
            alt="ישיבת שבילי התורה" 
            className="h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-blue-900">מחנה חורף תשפ"ו</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="אימייל / טלפון" 
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
            required 
            className="bg-blue-50 text-blue-900 font-medium"
          />
          <Input 
            label="סיסמה" 
            type="password" 
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            required 
            className="bg-blue-50 text-blue-900 font-medium"
          />
          
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100 font-medium">{error}</div>}
          
          <Button type="submit" className="w-full justify-center text-lg py-3 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200">התחברות</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;