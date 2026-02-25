import "./Advanced.css";
import axios from "../../axiosURL.js";
import { useState } from "react";
import {ThreeDot} from "react-loading-indicators";

const Advanced = () => {
        const [loading, setLoading] = useState({});
        const [result, setResult] = useState({});
    
        const runScript = async (script) => {
            setLoading((prev) => ({...prev, [script]: true}));
            setResult((prev) => ({...prev, [script]: null}));
            try{
                const res = await axios.post(`scripts/${script}`);
                console.log(res.data);
                setResult((prev) => ({ ...prev, [script]: "Erfolgreich abgeschlossen"}));
            }catch(err){
                console.log(err);
                setResult((prev) => ({ ...prev, [script]: "Fehler beim Ausführen des Skripts"}));
            }finally{
                setLoading((prev) => ({ ...prev, [script]: false}));
            }
        };

    return(
        <div className="Advanced">
            <div className="Advanced__Header">
                <div className="Advanced__Header__Title">
                    <h1>Skripte</h1>
                </div>
            </div>
            <div className="Advanced__Body">
                <div className="Advanced__Body__Section">
                    <div className="Advanced__Body__Section__Content">
                        <table>
                            <thead>
                                <th>
                                    Vulnerability scan
                                </th>
                                <th></th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <button className="Advanced__Button" onClick={() => runScript("checkCiscoVulnerabilities")}>{loading["checkCiscoVulnerabilities"] ? <ThreeDot color="#075033" size="small"/> : "Scan starten"}</button> 
                                    </td>
                                    <td>
                                        {result["checkCiscoVulnerabilities"] && !loading["checkCiscoVulnerabilities"] && <p className="Advanced__Body__Section__Content__Result">{result["checkCiscoVulnerabilities"]}</p>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="Advanced__Body__Section">
                    <div className="Advanced__Body__Section__Content">
                        <table>
                            <thead>
                                <th>
                                    Netzwerk scan
                                </th>
                                <th></th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <button className="Advanced__Button" onClick={() => runScript("scanNetwork")}>{loading["scanNetwork"] ? <ThreeDot color="#075033" size="small"/> : "Scan starten"}</button>
                                    </td>
                                    <td>
                                        {result["scanNetwork"] && !loading["scanNetwork"] && <p className="Advanced__Body__Section__Content__Result">{result["scanNetwork"]}</p>} 
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="Advanced__Body__Section">
                    <div className="Advanced__Body__Section__Content">
                        <table>
                            <thead>
                                <th>
                                    Firmware scan
                                </th>
                                <th></th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <button className="Advanced__Button" onClick={() => runScript("checkFirmware")}>{loading["checkFirmware"] ? <ThreeDot color="#075033" size="small"/> : "Scan starten"}</button>
                                    </td>
                                    <td>
                                        {result["checkFirmware"] && !loading["checkFirmware"] && <p className="Advanced__Body__Section__Content__Result">{result["checkFirmware"]}</p>} 
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Advanced;