import "./AllDevices.css";
import { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { loadDevices } from "../../reducer/devicesReducer";
import { Navigate, useNavigate } from "react-router-dom";
import ip from "ip";
import {ArrowDownNarrowWide, ArrowUpWideNarrow} from "lucide-react";


const AllDevices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {devices, loading, error} = useSelector((state) => state.devices);
    const [sortConfig, setSortConfig] = useState({
        key: "ip",
        direction: "asc"
    });

    useEffect(() => {
        dispatch(loadDevices());
    }, [dispatch]);

    const severityOrder = ["Critical", "High", "Medium", "Low", "Info"];

    const handleSort = (key) => {
        setSortConfig((prev) => {
            //Sortierung umdrehen bei nochmaligem sortieren
            if(prev.key === key){
                return{
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }
            return{key, direction: "asc"};
        });
    };

    const ipToNumber = (ipAddr) => {
        return ip.toLong(ipAddr);
    };

    const fwToNumber = (fwVersion) => {
        if(!fwVersion) return 0;

        //Buchstaben entfernen
        fwVersion = fwVersion.replace(/[^\d.]/g, "");

        const parts = fwVersion.split(".");
        const major = parseInt(parts[0] || 0);
        const minor = parseInt(parts[1] || 0);
        const patch = parseInt(parts[2] || 0);

        return major*1000 + minor*100 + patch;
    }

    const toTime = (value) => {
        if(!value) return 0;
        return new Date(value).getTime();
    }

    const getHighestSeverity = (device) => {
        const vulns = device.vulnerabilities || [];

        const highest = vulns.reduce((acc, v) => {
            if (!v.severity) return acc;
            if(!acc) return v.severity;
            return severityOrder.indexOf(v.severity) < severityOrder.indexOf(acc)
                ? v.severity
                : acc;
        }, null);

        return highest || "-";
    }

    const getHighestCvss = (device) => {
        const vulns = device.vulnerabilities || [];

        const highest  = vulns.reduce((max, v) => {
            const score = parseFloat(v.cvssScore || 0);
            return score > max ? score : max
        }, 0);

        return highest || 0;
    }

    const sortedDevices = [...devices].sort((a,b) => {
        const {key, direction} = sortConfig;
        const factor = direction === "asc" ? 1 : -1;

        if(key === "ip"){
            return(ipToNumber(a.ip) - ipToNumber(b.ip))  * factor;
        }

        if(key === "hostname"){
            const aVal = a.hostname || "";
            const bVal = b.hostname || "";
            return aVal.localeCompare(bVal, "de-DE") * factor;
        }

        if(key === "model"){
            const aVal = a.model || "";
            const bVal = b.model || "";
            return aVal.localeCompare(bVal, "de-DE") * factor;
        }

        if(key === "fwVersion"){
            return (fwToNumber(a.firmware?.version) - fwToNumber(b.firmware?.version)) * factor;
        }

        if(key === "vulnerabilities"){
            const aCount = (a.vulnerabilities || []).length;
            const bCount = (b.vulnerabilities || []).length;
            return (aCount - bCount) * factor;
        }

        if(key === "lastSeen"){
            return (toTime(a.lastSeen) - toTime(b.lastSeen)) * factor
        }

        if(key === "lastChecked"){
            return (toTime(a.firmware.lastChecked) - toTime(b.firmware.lastChecked)) * factor
        }


        if(key === "highestSeverity"){
            const aVal = severityOrder.indexOf(getHighestSeverity(a));
            const bVal = severityOrder.indexOf(getHighestSeverity(b));

            return (aVal - bVal) * factor
        }

        if(key === "highestCvss"){
            const aVal = getHighestCvss(a)
            const bVal = getHighestCvss(b)

            return (aVal - bVal) * factor;
        }

        return 0;
    });

    const sortIcon = (key) => {
        const isActive = sortConfig.key === key;

        return(
            <span>
                {isActive
                    ? (sortConfig.direction === "asc"
                        ? <ArrowDownNarrowWide/>
                        : <ArrowUpWideNarrow/>)
                    : <span style={{opacity: 0}}><ArrowDownNarrowWide/></span>
                }
            </span>
        );
    };

    return(
        <div className="AllDevices">
            <div className="AllDevices__Header">
                <h1 className="AllDevices__Title">Geräte</h1>
            <button className="AllDevices__Button" onClick={() => navigate("/advanced")}>Skripte</button>
            </div>
            
            <table className="AllDevices__Table">
                 <colgroup>
                    <col className="col-ip"/>
                    <col className="col-hostname"/>
                    <col className="col-model"/>
                    <col className="col-lastSeen"/>
                    <col className="col-fwVersion"/>
                    <col className="col-lastChecked"/>
                    <col className="col-vulns"/>
                    <col className="col-highestSev"/>
                    <col className="col-highestCvss"/>
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan="4">Gerät</th>
                        <th colSpan="2">Firmware</th>
                        <th colSpan="3">Vulnerabilities</th>
                    </tr>
                    <tr>
                        <th onClick={() => handleSort("ip")} className="AllDevices__Table__Click">IP-Adresse {sortIcon("ip")}</th>
                        <th onClick={() => handleSort("hostname")} className="AllDevices__Table__Click">Hostname {sortIcon("hostname")}</th>
                        <th onClick={() => handleSort("model")} className="AllDevices__Table__Click">Modell {sortIcon("model")}</th>
                        <th onClick={() => handleSort("lastSeen")} className="AllDevices__Table__Click">
                            <span className="AllDevices__Table__HeaderWithIcon">
                                <span className="AllDevices__Table__HeaderWithIcon__Text">Zuletzt <br />gesehen</span>
                                <span className="AllDevices__Table__HeaderWithIcon__Icon">{sortIcon("lastSeen")}</span>
                            </span>
                        </th>
                        <th onClick={() => handleSort("fwVersion")} className="AllDevices__Table__Click">
                            <span className="AllDevices__Table__HeaderWithIcon">
                                <span className="AllDevices__Table__HeaderWithIcon__Text">Firmware <br />Version</span>
                                <span className="AllDevices__Table__HeaderWithIcon__Icon">{sortIcon("fwVersion")}</span>
                            </span>
                        </th>
                        <th onClick={() => handleSort("lastChecked")} className="AllDevices__Table__Click">
                            <span className="AllDevices__Table__HeaderWithIcon">
                                <span className="AllDevices__Table__HeaderWithIcon__Text">Zuletzt <br />geprüft</span>
                                <span className="AllDevices__Table__HeaderWithIcon__Icon">{sortIcon("lastChecked")}</span>
                            </span>
                        </th>
                        <th onClick={() => handleSort("vulnerabilities")} className="AllDevices__Table__Click">Vulnerabilities {sortIcon("vulnerabilities")}</th>
                        <th onClick={() => handleSort("highestSeverity")} className="AllDevices__Table__Click">
                            <span className="AllDevices__Table__HeaderWithIcon">
                                <span className="AllDevices__Table__HeaderWithIcon__Text">Highest <br />Severity</span>
                                <span className="AllDevices__Table__HeaderWithIcon__Icon">{sortIcon("highestSeverity")}</span>
                            </span>
                        </th>
                        <th onClick={() => handleSort("highestCvss")} className="AllDevices__Table__Click">
                            <span className="AllDevices__Table__HeaderWithIcon">
                                <span className="AllDevices__Table__HeaderWithIcon__Text">Highest <br />CVSS Score</span>
                                <span className="AllDevices__Table__HeaderWithIcon__Icon">{sortIcon("highestCvss")}</span>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedDevices.map((device) => {

                        const highestSeverity = getHighestSeverity(device);
                        const highestScore = getHighestCvss(device);

                        const vulns = device.vulnerabilities || [];
                        const vulnCount = vulns.length;

                        return(               
                            <tr key={device._id}>
                                <td className="AllDevices__Table__Click" onClick={()=>navigate(`/device/${device.ip}`)}>{device.ip}</td>
                                <td>{device.hostname || "-"}</td>
                                <td>{device.model || "-"}</td>
                                <td>{device.lastSeen ? new Date(device.lastSeen).toLocaleString("de-DE") : "-"}</td>
                                <td>{device.firmware?.version || "-"}</td>
                                <td>{device.firmware?.lastChecked ? new Date(device.firmware.lastChecked).toLocaleString("de-DE") : "-"}</td>
                                <td className={`AllDevices__Table__Vuln__${highestSeverity}`}>{vulnCount || 0}</td>
                                <td className={`AllDevices__Table__Vuln__${highestSeverity}`}>{highestSeverity}</td>
                                <td className={`AllDevices__Table__Vuln__${highestSeverity}`}>{highestScore}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default AllDevices;