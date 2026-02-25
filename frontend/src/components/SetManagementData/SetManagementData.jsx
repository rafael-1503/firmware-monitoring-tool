import "./SetManagementData.css";
import { useState } from "react";
import axios from "../../axiosURL.js"
import { useNavigate } from "react-router-dom";

const SetManagementData = () =>{
    const navigate = useNavigate();

    const [mgmtData, setMgmtData] = useState({
        mgmtNet: [""],
        snmpUser: "",
        snmpAuthKey: "",
        snmpPrivKey: "",
        ciscoApiId: "",
        ciscoApiSecret: "",
        teamsWebhook: "",
        description: ""
    });

    const onMgmtDataChange = (e) => {
        setMgmtData({...mgmtData, [e.target.name]: e.target.value});
    };

    const onMgmtNetChange = (index, value) => {
        const newArray = [...mgmtData.mgmtNet];
        newArray[index] = value;
        setMgmtData({...mgmtData, mgmtNet: newArray});
    };

    const addMgmtNetField = () => {
        setMgmtData({
            ...mgmtData,
            mgmtNet: [...mgmtData.mgmtNet, ""]
        });
    };

    const removeMgmtNetField = (index) => {
        const newArray = mgmtData.mgmtNet.filter((_, i) => i !== index);
        setMgmtData({
            ...mgmtData,
            mgmtNet: newArray
        });
    };

    const onSave = async () => {
        const cleanedMgmtNet = mgmtData.mgmtNet.filter(v => v.trim() !== "");

        let mgmtObj = {
            ...mgmtData
        };

        if(cleanedMgmtNet.length > 0){
            mgmtObj.mgmtNet = cleanedMgmtNet;
        } else{
            delete mgmtObj.mgmtNet;
        }

        Object.keys(mgmtObj).forEach((key) => {
            if(mgmtObj[key] === ""){
                delete mgmtObj[key];
            }
        });

        console.log("MgmtObj: " + JSON.stringify(mgmtObj, null, 2))
        

        try{
            const res = await axios.post("management", mgmtObj);
                
            if(res.status === 201){
                alert("Managment Daten erfolgreich erstellt!")
                navigate("/");
            }else{
                alert("Gerät konnte nicht erfolgreich gespeichert werden.");
            }
        } catch(err){
            if(err.response?.status === 409){
                try{
                    const res = await axios.put("management", mgmtObj);
                    if(res.status === 200){
                        alert("Managment Daten erfolgreich geupdated!")
                        navigate("/");
                    }else{
                        alert("Gerät konnte nicht erfolgreich gespeichert werden.");
                    }
                } catch(putErr){
                    console.error(putErr);
                    alert("PUT Error: " + putErr.message);
                }
            } else{
                console.error(err);
                alert("POST Error: " + err.message)
            }
        }
    };

    const onFetch = async () =>{
        try{
            const res = await axios.get("management");
            alert(JSON.stringify(res.data, null, 2));
        } catch(err){
            console.error(err);
            alert("Fehler beim Abrufen der Management Daten: " + err.response?.data)
        }
    };


    return(
        <div className="SetManagementData">
            <div className="SetManagementData__Header">
                <div className="SetManagementData__Header__Title">
                    <h1>Management Daten anlegen / ändern</h1>
                </div>
            </div>
            <div className="SetManagementData__Body">
                <div className="SetManagementData__Body__Section">
                    <div className="SetManagementData__Body__Section__Title">
                        <h2>Aktuelle Management Daten abrufen</h2>
                    </div>
                    <div className="SetManagementData__Body__Section__Content">                        
                        <button className="SetManagementData__Button SetManagementData__Button--save" onClick={(onFetch)}>Management Daten abrufen</button>
                    </div>
                </div>
                <div className="SetManagementData__Body__Section">
                    <div className="SetManagementData__Body__Section__Title">
                        <h2>Management Netz</h2>
                    </div>
                    <div className="SetManagementData__Body__Section__Content">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Management-Netz</td>
                                    <td>
                                        {mgmtData.mgmtNet.map((net, index) => (
                                            <div key={index}>
                                                <input type="Text" value={net} placeholder="IP-Netz in CIDR (z.B. 192.168.1.0/24)" onChange={(e) => onMgmtNetChange(index, e.target.value)} className="SetManagementData__Body__Section__Content__InputIP"/>
                                                <button className="SetManagementData__Button" type="button" onClick={() => removeMgmtNetField(index)}>
                                                    Entfernen
                                                </button>
                                            </div>
                                        ))}
                                        <button className="SetManagementData__Button" type="button" onClick={addMgmtNetField}>
                                            + Management Netz hinzufügen
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
                <div className="SetManagementData__Body__Section">
                    <div className="SetManagementData__Body__Section__Title">
                        <h2>SNMP Credentials</h2>
                    </div>
                    <div className="SetManagementData__Body__Section__Content">
                        <table>
                            <tbody>
                                <tr>
                                    <td>SNMP-User</td>
                                    <td><input name="snmpUser" type="Text" value={mgmtData.snmpUser} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                                <tr>
                                    <td>SNMP-AuthKey</td>
                                    <td><input name="snmpAuthKey" type="Password" value={mgmtData.snmpAuthKey} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                                <tr>
                                    <td>SNMP-PrivKey</td>
                                    <td><input name="snmpPrivKey" type="Password" value={mgmtData.snmpPrivKey} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
                <div className="SetManagementData__Body__Section">
                    <div className="SetManagementData__Body__Section__Title">
                        <h2>Cisco API Credentials</h2>
                    </div>
                    <div className="SetManagementData__Body__Section__Content">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Cisco Api ID</td>
                                    <td><input name="ciscoApiId" type="Text" value={mgmtData.ciscoApiId} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                                <tr>
                                    <td>Cisco Api Secret</td>
                                    <td><input name="ciscoApiSecret" type="Password" value={mgmtData.ciscoApiSecret} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="SetManagementData__Body__Section">
                    <div className="SetManagementData__Body__Section__Title">
                        <h2>Teams Webhook für Alerts</h2>
                    </div>
                    <div className="SetManagementData__Body__Section__Content">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Webhook URL</td>
                                    <td><input name="teamsWebhook" type="Text" value={mgmtData.teamsWebhook} placeholder="" onChange={(onMgmtDataChange)}></input></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="SetManagementData__Inputs__Save">
                    <button className="SetManagementData__Button SetManagementData__Button--save" onClick={(onSave)}>Speichern</button>
                </div>
            </div>
        </div>
    )
}

export default SetManagementData;


//HIER WEITER MACHEN