import "./AddDevice.css"
import { useState } from "react";
import axios from "../../axiosURL.js"
import { useNavigate } from "react-router-dom";

const AddDevice = () => {
    const navigate = useNavigate();

    const [deviceData, setDeviceData] = useState({
        hostname: "",
        ip: "",
        vendor: "Cisco",
        model: "",
        notes: "",
        firmware: {
            os: "",
            version: ""
        }
    });

    const onDeviceDataChange = (e) => {
        if(e.target.name.startsWith("firmware.")){
            const field = e.target.name.split(".")[1];
            setDeviceData({
                ...deviceData, 
                firmware: {
                    ...deviceData.firmware,
                    [field]: e.target.value
                }
            });
        }else{
            setDeviceData({...deviceData, [e.target.name]: e.target.value});
        }
    };

    const onSave = () => {
        let deviceObj = {
            ...deviceData,
            lastSeen: new Date().toISOString()
        }

        axios.post("device", deviceObj)
            .then((res) => {
                if(res.status === 201 && res.data === "successfully added!"){
                    navigate("/")
                }else{
                    alert("Gerät konnte nicht erfolgreich gespeichert werden.")
                }
            }).catch((err) => {
                console.log(err)
                alert("Gerät wurde nicht gespeichert. \nFehler: " + err.response.data)
            })
    };

    return(
        <div className="AddDevice">
            <div className="AddDevice__Header">
                <div className="AddDevice__Header__Title">
                    <h1>Neues Gerät anlegen</h1>
                </div>
            </div>
            <div className="AddDevice__Body">
                <div className="AddDevice__Body__Section">
                    <div className="AddDevice__Body__Section__Title"></div>
                    <div className="AddDevice__Body__Section__Content">
                        <h2>Geräte Informationen</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Hostname</td>
                                    <td><input name="hostname" type="Text" value={deviceData.hostname} placeholder="Hostname des Geräts" onChange={(onDeviceDataChange)}></input></td>
                                </tr>
                                <tr>
                                    <td>IP</td>
                                    <td><input name="ip" type="Text" value={deviceData.ip} placeholder="Ip des Geräts" onChange={(onDeviceDataChange)}></input></td>
                                </tr>
                                {/* <tr>
                                    <td>Hersteller</td>
                                    <td><input name="vendor" type="Text" value={deviceData.vendor} placeholder="Hersteller des Geräts" onChange={(onDeviceDataChange)}></input></td>
                                </tr> */}
                                <tr>
                                    <td>Modell</td>
                                    <td><input name="model" type="Text" value={deviceData.model} placeholder="Modell des Geräts" onChange={(onDeviceDataChange)}></input></td>
                                </tr>
                                <tr>
                                    <td>Notizen</td>
                                    <td><textarea name="notes" value={deviceData.notes} placeholder="Notizen des Geräts" onChange={(onDeviceDataChange)}></textarea></td>
                                </tr>
                            </tbody>
                        </table>
                        <h2>Firmware (optional falls bekannt)</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>OS</td>
                                    {/* <td><input name="firmware.os" type="Text" value={deviceData.firmware.os} placeholder="Betriebssystem des Geräts" onChange={(onDeviceDataChange)}></input></td> */}
                                    <td>
                                        <select name="firmware.os" value={deviceData.firmware.os} onChange={(onDeviceDataChange)}>
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
                                    <td><input name="firmware.version" type="Text" value={deviceData.firmware.version} placeholder="Version der Firmware" onChange={(onDeviceDataChange)}></input></td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="AddDevice__Inputs__Save">
                            <button className="AddDevice__Button AddDevice__Button--save" onClick={(onSave)}>Speichern</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddDevice;