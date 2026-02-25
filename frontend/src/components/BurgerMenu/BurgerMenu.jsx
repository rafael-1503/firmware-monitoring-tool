import "./BurgerMenu.css"
import Hamburger from "hamburger-react"
import { useState, useEffect, useRef } from "react"
import {Link} from "react-router-dom";


const BurgerMenu = () => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpen(false)
        }
        }

        if (open) {
            document.addEventListener("pointerdown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
        }
    }, [open])


    return (
        <div>
            <div className={`burger-button${open ? ' shifted' : ''}`}>
                <Hamburger
                    size={30}
                    toggled={open}
                    toggle={setOpen}
                    color="#ffffff"
                />
            </div>

            <div ref={menuRef} className={`menu${open ? ' open' : ''}`}>
                <ul>
                    <li><Link to={""} className="Button" onClick={() => setOpen(false)}>Geräte</Link></li>
                    <li><Link to={"/addDevice"} className="Button" onClick={() => setOpen(false)}>Gerät hinzufügen</Link></li>
                    <li><Link to={"/advanced"} className="Button" onClick={() => setOpen(false)}>Skripte</Link></li>
                    <li><Link to={"/checkNewFirmware"} className="Button" onClick={() => setOpen(false)}>Neue Firmware prüfen</Link></li>
                    <li><Link to={"/setManagementData"} className="Button" onClick={() => setOpen(false)}>Management-Daten setzen</Link></li>
                </ul>
            </div>
        </div>
    )
}

export default BurgerMenu;