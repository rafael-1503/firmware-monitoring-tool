import "./CheckNewFirmware.css";
import axios from "../../axiosURL";
import { useState } from "react";




const CheckNewFirmware = () => {

    const [os, setOs] = useState("");
    const [version, setVersion] = useState("");
    const [vulnerabilities, setVulnerabilities] = useState([]);


    const onFetch = async () => {
        try{
            setVulnerabilities([])
            const res = await axios.get(`cisco/vuln/${os}/${version}`);
            console.log("Api Antwort: ", res.data);

            if(res.data.advisories && Array.isArray(res.data.advisories)){
                setVulnerabilities(res.data.advisories);
            }else{
                setVulnerabilities([]);
            }
        }catch(err){
            console.error(err);
        }
    };

    return(
        <div className="CheckNewFirmware">
            <div className="CheckNewFirmware__Header">
                <h1>Neue Firmware Versionen auf Vulnerabilities prüfen</h1>
            </div>
            <div className="CheckNewFirmware__Body">
                <div className="CheckNewFirmware__Body__Section">
                    <div className="CheckNewFirmware__Body__Section__Title">
                        <h2 className="CheckNewFirmware__FirmwareInputs">Firmware</h2>
                    </div>
                    <div className="CheckNewFirmware__Body__Section__Content">
                        <table className="CheckNewFirmware__FirmwareInputs">
                            <tbody>
                                <tr>
                                    <td>OS</td>
                                    <td>
                                        <select value={os} onChange={(e) => setOs(e.target.value)}>
                                            <option value="">Bitte auswählen ...</option>
                                            <option value="iosxe">IOSXE</option>
                                            <option value="ios">IOS</option>
                                            <option value="asa">ASA</option>
                                            <option value="ftd">FTD</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Version</td>
                                    <td><input type="Text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="z.B. 17.15.4"/></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><button className="CheckNewFirmware__Button" onClick={(onFetch)}>Prüfen</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="CheckNewFirmware__Body__Section">
                    <div className="CheckNewFirmware__Body__Section__Title">
                        <h2>Vulnerabilities</h2>
                    </div>
                    <div className="CheckNewFirmware__Body__Section__Content">
                        {vulnerabilities && vulnerabilities.length > 0 ? (
                        vulnerabilities.map((vuln) => (

                            <table key={vuln.advisoryId}>
                                <tbody>
                                    <tr>
                                        <td>Title</td>
                                        <td className="CheckNewFirmware__Body__Section__Content__VulnTitle">{vuln.advisoryTitle}</td>
                                    </tr>
                                    <tr>
                                        <td>Advisory ID</td>
                                        <td>{vuln.advisoryId}</td>
                                    </tr>
                                    <tr>
                                        <td>CVEs</td>
                                        <td>{vuln.cves.join(", ")}</td>
                                    </tr>
                                    <tr>
                                        <td>Version</td>
                                        <td>Version: {vuln.version} | FirstPublished: {vuln.firstPublished ? new Date(vuln.firstPublished).toLocaleString("de-DE") : "-"} | LastUpdated: {vuln.lastUpdated ? new Date(vuln.lastUpdated).toLocaleString("de-DE") : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td>Severity</td>
                                        <td className={`CheckNewFirmware__Table__Vuln__${vuln.sir}`}>{vuln.sir}</td>
                                    </tr>
                                    <tr>
                                        <td>CVSS Score</td>
                                        <td className={`CheckNewFirmware__Table__Vuln__${vuln.sir}`}>{vuln.cvssBaseScore}</td>
                                    </tr>
                                    <tr>
                                        <td>URL</td>
                                        <td>
                                            <a href={vuln.publicationUrl} target="_blank">
                                                {vuln.publicationUrl}
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Erste behobene Version</td>
                                        <td>{vuln.firstFixed}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            ))
                        ):(
                            <p className="CheckNewFirmware__middle">_</p>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckNewFirmware;