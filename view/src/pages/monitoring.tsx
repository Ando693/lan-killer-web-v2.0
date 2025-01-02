import React, { useState, useEffect } from "react";
import { LuRocket, LuRepeat2, LuXSquare, LuWifi, LuWifiOff } from "react-icons/lu";
import { Progress, Error } from "./utils";

type Data = {
    ip: string,
    mac: string,
    vendor: string
}

const API = "http://localhost:5000/";

const Monitoring: React.FC = () => {
    const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({});
    const [tabledata, setTableData] = useState<Data[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchValue, setSearchValue] = useState<string>('');
    const [broadcast, setBroadcast] = useState<boolean>(false)
    const [isHeaderChecked, setIsHeaderChecked] = useState<boolean>(false);

    const getHosts = async () => {
        setCheckedRows({})
        setLoading(true);
        try {
            const response = await fetch(`${API}/hosts`);
            const data: Data[] = await response.json();
            setTableData(data);
        } catch (err: any) {
            console.log(err);
            setError(err.toString());
        }
        setLoading(false);
    };

    const blockhosts = async (hosts:Data[]) => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/block`, {
                headers: {'Content-Type' : 'application/json'},
                method: 'POST',
                body: JSON.stringify(hosts)
            });
            const data = await response.json();
            setLoading(false)
            if(data) 
            {
                getHosts();    
            }
            else { setError("Une erreur s'est produite !") }
        }
        catch (err: any) {
            console.log(err);
            setLoading(false);
            setError(err.toString());
        }
    };

    const handleCheckboxChange = (index?: number) => {
        if (index === undefined) {
            const newCheckedRows = !isHeaderChecked;
            setIsHeaderChecked(newCheckedRows);
            const updatedCheckedRows: { [key: number]: boolean } = {};
            tabledata.forEach((_, idx) => {
                updatedCheckedRows[idx] = newCheckedRows;
            });
            setCheckedRows(updatedCheckedRows);
        } else {
            setCheckedRows(prevState => {
                const newCheckedRows = { ...prevState };
                newCheckedRows[index] = !prevState[index];
                if (!newCheckedRows[index]) {
                    setIsHeaderChecked(false);
                }
                return newCheckedRows;
            });
        }
    };

    const handleBlockButtonClick = () => {
        const selectedData = Object.keys(checkedRows)
            .filter(key => checkedRows[parseInt(key)])
            .map(Number)
            .map(index => tabledata[index]);
        
        if(selectedData.length < 1)
        {
            alert('Please select at least one host!')
            return
        }
        blockhosts(selectedData);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const getBroadcastStatus = async () => {
        try {
            const response = await fetch(`${API}/getBroadcast`);
            const result = await response.json();
            
            if(result)
            {
                setBroadcast(true);
            }
            else {setBroadcast(false);}
        } 
        catch (err: any) {
            setError(err.toString());
        }
    };

    const setBroadcastStatus = async () => {
        try {
            const response = await fetch(`${API}/setBroadcast`, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({status: !broadcast})
            });
            const result = await response.json();

            if(result)
            {
                getBroadcastStatus();    
            }
            else {setError('Une erreur s\'est produite !')}
        }
        catch(err: any) {
            setError(err.toString());
        }
    };

    useEffect(() => {getHosts(); getBroadcastStatus()}, []);

    const filteredData = tabledata.filter((item) => {
        return (
            item.ip.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.mac.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchValue.toLowerCase())
        );
    });

    return (
        <div className="homebox">
            <div className="navbar">
                <div>
                    <input type="text" placeholder="search for host" value={searchValue} onChange={handleSearchChange} />
                </div>
                <div>
                    {broadcast? 
                    <div>
                        <button title="Disable broadcast" onClick={setBroadcastStatus}>
                            <LuWifi/>
                        </button>
                        <p>Broadcast enabled</p>
                    </div> :
                    <div>
                        <button title="Enable broadcast" onClick={setBroadcastStatus}>
                            <LuWifiOff/>
                        </button>
                        <p>Broadcast disabled</p>
                    </div> 
                    }
                    <button title="Bloc" onClick={handleBlockButtonClick}><LuRocket/></button>
                    <button title="Refresh" onClick={getHosts}><LuRepeat2/></button>
                </div>
            </div>
            <div className="box">
                <div className="tablebox">
                    <h3>Hosts detected on the network</h3>
                    {loading ? (
                        <div className="loading-box"><Progress/></div>
                    ) : error ? (
                        <div className="loading-box"><Error message={error}/></div>
                    ) : tabledata.length < 1 ? (
                        <div className="loading-box">
                            <div className="notfound-box">
                            <LuXSquare className="icon"/>
                            <p>No result found!</p>
                        </div>
                    </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th className="checkcase">
                                    <input
                                        type="checkbox"
                                        checked={isHeaderChecked}
                                        onChange={() => handleCheckboxChange()}
                                    />
                                    </th>
                                    <th>IP Address</th>
                                    <th>MAC Address</th>
                                    <th>MAC Vendor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((e, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input type="checkbox" checked={!!checkedRows[index]} onChange={() => handleCheckboxChange(index)}/>
                                        </td>
                                        <td>{e.ip}</td>
                                        <td>{e.mac}</td>
                                        <td>{e.vendor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
