import { useDispatch } from "react-redux"
import "./DeviceDetail.css"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "../../axiosURL"
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const DeviceDetail = () => {

    const dispatch = useDispatch()
    const {ip} = useParams()
    const [device, setDevice] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        hostname: "",
        vendor: "",
        model: "",
        notes: ""
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const navigate = useNavigate();
    
    const loadDevice = () => {
        axios.get(`device/${ip}`)
        .then(res=>setDevice(res.data))
        .catch(err=>{
            console.log(err)
        })
    }

    

    useEffect(()=>{
        loadDevice();
    }, [ip]);

    if(!device){
        return <p>Lade Gerät...</p>
    }

    const vulnerabilities = device.vulnerabilities;

    const sortedVulnerabilities = [...(vulnerabilities || [])].sort((a,b) => {
        const aScore = parseFloat(a.cvssScore || 0);
        const bScore = parseFloat(b.cvssScore || 0);

        return bScore - aScore;
    });

    console.log("Device:", device);
    console.log("Vulnerabilities:", device.vulnerabilities);

    //Edit Device

    const onStartEdit = () => {
        setEditData({
            hostname: device.hostname || "",
            vendor: device.vendor || "",
            model: device.model || "",
            notes: device.notes || ""
        })
        setSaveError(null)
        setIsEditing(true)
    };

    const onCancelEdit = () => {
        setIsEditing(false)
        setSaveError(null)
    };

    const onDeviceChange = (e) => {
        const {name, value} = e.target
        setEditData(prev => ({
            ...prev,
            [name]: value
        }))
    };

    const onDelete = async () => {
        const ip = device.ip;
        const result = window.confirm("Soll dieses Gerät wirklich gelöscht werden?");
        if(!result){return}

        try{
            await axios.delete(`device/${ip}`)
            console.log("Gerät erfolgreich gelöscht! (", device.ip, ")")
            navigate("/")
        }catch(err){
            console.log("Löschen fehlgeschlagen", err)
        }
    };

    const onSave = async () => {
        try{
            setIsSaving(true)
            setSaveError(null)

            const changedFields = {};

            Object.keys(editData).forEach(key => {
                if(editData[key] !== device[key]){
                    changedFields[key] = editData[key];
                }
            });

            const res = await axios.put(`device/${ip}`, changedFields);
            
            setDevice(res.data || editData)
            setIsEditing(false)
        }catch(err){
            console.error(err)
            setSaveError("Speichern fehlgeschlagen. Bitte versuchen Sie es später erneut.")
        }finally{
            setIsSaving(false)
        }
    };

    return(
        <div className="DeviceDetail">
            <div className="DeviceDetail__Header">
                <h1>{device.hostname}</h1>

                <div className="DeviceDetail__Header__Actions">
                    {!isEditing && (
                        <div className="DeviceDetail__Buttons">
                            <button 
                                type="button" 
                                className="DeviceDetail__Button DeviceDetail__Button--edit" 
                                onClick={onStartEdit}
                                >
                                    <Pencil/> Bearbeiten
                            </button>
                            
                            <button
                                type="button"
                                className="DeviceDetail__Button DeviceDetail__Button--edit"
                                onClick={onDelete}
                                >
                                    <Trash2/> Löschen
                            </button>
                        </div>

                    )}
                    {isEditing && (
                        <>
                            <button 
                                type="button" 
                                className="DeviceDetail__Button DeviceDetail__Button--cancel" 
                                onClick={onCancelEdit} 
                                disabled={isSaving}
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                className="DeviceDetail__Button DeviceDetail__Button--save"
                                onClick={onSave}
                                disabled={isSaving}
                            >
                                {isSaving ? "Speichere..." : "Speichern"}
                            </button>
                        </>
                    )}

                </div>
            </div>
            <div className="DeviceDetail__Body">
                <div className="DeviceDetail__Body__Section">
                    <div className="DeviceDetail__Body__Section__Title">
                        <h2>Geräte Informationen</h2>
                    </div>
                    <div className="DeviceDetail__Body__Section__Content">
                        {!isEditing ? (
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Hostname</td>
                                        <td>{device.hostname}</td>
                                    </tr>
                                    <tr>
                                        <td>IP</td>
                                        <td>{device.ip}</td>
                                    </tr>
                                    <tr>
                                        <td>Hersteller</td>
                                        <td>{device.vendor}</td>
                                    </tr>
                                    <tr>
                                        <td>Modell</td>
                                        <td>{device.model}</td>
                                    </tr>
                                    <tr>
                                        <td>Zuletzt Gesehen</td>
                                        <td>{device.lastSeen ? new Date(device.lastSeen).toLocaleString("de-DE") : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td>Notizen</td>
                                        <td>{device.notes}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ):(
                            <form className="DeviceDetail__Body__Section__Content__Form" onSubmit={(e) => {e.preventDefault(); onSave();}}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Hostname</td>
                                            <td>
                                                <input type="text" name="hostname" value={editData.hostname} onChange={onDeviceChange}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>IP</td>
                                            <td>{device.ip}</td>
                                        </tr>
                                        <tr>
                                            <td>Hersteller</td>
                                            <td>
                                                <input type="text" name="vendor" value={editData.vendor} onChange={onDeviceChange}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Modell</td>
                                            <td>
                                                <input type="text" name="model" value={editData.model} onChange={onDeviceChange}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Zuletzt Gesehen</td>
                                            <td>{device.lastSeen ? new Date(device.lastSeen).toLocaleString("de-DE") : "-"}</td>
                                        </tr>
                                        <tr>
                                            <td>Notizen</td>
                                            <td>
                                                <textarea name="notes" rows={4} value={editData.notes} onChange={onDeviceChange}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                {saveError && (
                                    <p className="DeviceDetail__Body__Section__Content_Error">{saveError}</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
                <div className="DeviceDetail__Body__Section">
                    <div className="DeviceDetail__Body__Section__Title">
                        <h2>Firmware</h2>
                    </div>
                    <div className="DeviceDetail__Body__Section__Content">
                        <table>
                            <tbody>
                                <tr>
                                    <td>OS</td>
                                    <td>{device.firmware?.os}</td>
                                </tr>
                                <tr>
                                    <td>Version</td>
                                    <td>{device.firmware?.version}</td>
                                </tr>
                                <tr>
                                    <td>Zuletzt geprüft</td>
                                    <td>{device.firmware?.lastChecked ? new Date(device.firmware.lastChecked).toLocaleString("de-DE") : "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="DeviceDetail__Body__Section">
                    <div className="DeviceDetail__Body__Section__Title">
                        <h2>Vulnerabilities</h2>
                    </div>
                    <div className="DeviceDetail__Body__Section__Content">
                        {sortedVulnerabilities && sortedVulnerabilities.length > 0 ? (
                            sortedVulnerabilities.map((vuln) => (

                            <table key={vuln.advisoryId}>
                                <tbody>
                                    <tr>
                                        <td>Title</td>
                                        <td className="DeviceDetail__Body__Section__Content__VulnTitle">{vuln.title}</td>
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
                                        <td className={`DeviceDetail__Table__Vuln__${vuln.severity}`}>{vuln.severity}</td>
                                    </tr>
                                    <tr>
                                        <td>CVSS Score</td>
                                        <td className={`DeviceDetail__Table__Vuln__${vuln.severity}`}>{vuln.cvssScore}</td>
                                    </tr>
                                    <tr>
                                        <td>URL</td>
                                        <td>
                                            <a href={vuln.url} target="_blank">
                                                {vuln.url}
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
                        ) : (
                            <p className="DeviceDetail__middle">_</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeviceDetail;

/*
IDEEN:

Oben rechts button für gerät löschen oder bearbeiten (hostname, modell)
Bei Feld Notizen stift zum notizen bearbeiten

Oben neben der überschrift direkt anzeigen was ist die höchste severity, cvssScore
*/