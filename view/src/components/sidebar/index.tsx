import { LuRadio } from "react-icons/lu"
import { LuSparkles } from "react-icons/lu"
import { LuShieldCheck } from "react-icons/lu"
import { LuMonitorOff } from "react-icons/lu"
import { LuPower } from "react-icons/lu"

interface SidebarProps {
    action: (value: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ action }) => {

    return (
        <div className="sidebar">
            <h2 className="title">Lan killer web</h2>
            <div className="link-box">
                <div>
                    <ul>
                        <li className="link" onClick={() => {action(1)}}>
                            <LuRadio className="icon"/>
                            Network monitoring
                            </li>
                        <li className="link" onClick={() => {action(2)}}>
                            <LuMonitorOff className="icon"/>
                            Blocked hosts
                        </li>
                        <li className="link" onClick={() => {action(3)}}>
                            <LuShieldCheck className="icon"/>
                            Firewall blacklist
                        </li>
                    </ul>
                </div>
                <div>
                    <ul>
                        <li className="link" onClick={() => {action(4)}}>
                            <LuSparkles className="icon"/>
                            About us
                        </li>
                        <li>
                            <LuPower className="icon"/>
                            Power off
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )

}

export default Sidebar
