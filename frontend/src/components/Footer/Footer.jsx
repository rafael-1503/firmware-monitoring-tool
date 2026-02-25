import "./Footer.css"

const Footer = ({noRouter}) => {
    return(
        <div className="Footer">
            {!noRouter && (
                <div className="Info">
                    <a className="ApiDocs" href="/docs/" target="_blank">API Docs</a>
                    <a> | </a>
                    <a>&copy; 2025 Firmware-Monitoring Tool</a>
                    <a> | </a>
                    <a>Version 1.0</a>
                </div>
            )}
        </div>
    )
}

export default Footer;