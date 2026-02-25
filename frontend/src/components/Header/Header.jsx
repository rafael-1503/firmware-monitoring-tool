import "./Header.css";
import { Link } from "react-router-dom";
import bechtleLogo from "../../assets/Bechtle_Fusion_sRGB_White.png"

const Header = ({noRouter}) => {
    return(
        <div className="Header">
            {noRouter ? (
                <div className="Title">firmware-monitoring</div>
            ) : (
                <Link to={"/"} className='Title'>firmware-monitoring</Link>
            )}
            <img src={bechtleLogo} alt="Logo" className='Header__Logo'/>
        </div>
    )
}

export default Header;