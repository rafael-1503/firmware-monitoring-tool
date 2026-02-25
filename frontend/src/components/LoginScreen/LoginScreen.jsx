import "./LoginScreen.css";
import { useState } from "react";
import axios from "../../axiosURL";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("isAuthenticated") === "true");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post("login", {password});

            if(res.status === 200){
                sessionStorage.setItem("isAuthenticated", "true");
                setError("");
                navigate("/", {replace: true});
            }
        }catch(err){
            if(err.response){
                setError(err.response.data || "Login fehlgeschlagen");
            }else{
                setError("Server nicht erreichbar");
            }
        }
    };

        return(
            <div className="LoginScreen">
                <Header noRouter/>
                <div className="LoginScreen__Header">
                    <h1>Login</h1>
                </div>
                <div className="LoginScreen__Body">
                    <form onSubmit={handleSubmit}>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Passwort</td>
                                    <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort eingeben"/></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><button className="LoginScreen__Button" type="submit">Login</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                    {error && <p>{error}</p>}
                </div>
            </div>
        );
    }



export default LoginScreen;