import { LuCloudOff } from "react-icons/lu"

export const Progress = () => {

    return (
        <div className="miniloader-box">
            <div className="progress"></div>
        </div>
    )

}

export const Error :React.FC<{ message: string }> = ({ message }) => {

    return (
        <div className="error-box">
            <LuCloudOff className="icon"/>
            <p>{message}</p>
        </div>
    )

}