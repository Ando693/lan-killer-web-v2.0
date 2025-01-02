import React, { useState, useEffect } from "react";
import { LuTrash2, LuRepeat2 } from "react-icons/lu";
import { Progress, Error } from "./utils";
import { LuXSquare } from "react-icons/lu";

type Data = {
    ip: string,
    mac: string,
    vendor: string
}

const API = "http://localhost:5000/";

const Hosts: React.FC = () => {
    const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({});
    const [tabledata, setTableData] = useState<Data[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchValue, setSearchValue] = useState<string>('');

    const getHosts = async () => {
        setCheckedRows({})
        setLoading(true);
        try {
            const response = await fetch(`${API}/getblockedhosts`);
            const data: Data[] = await response.json();
            setTableData(data);
        } catch (err: any) {
            console.log(err);
            setError(err.toString());
        }
        setLoading(false);
    };

    const unblockhosts = async (hosts:Data[]) => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/unblock`, {
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



    const handleCheckboxChange = (index: number) => {
        setCheckedRows(prevState => {
            const newCheckedRows = { ...prevState };
            newCheckedRows[index] = !prevState[index];
            return newCheckedRows;
        });
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
        unblockhosts(selectedData);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    useEffect(() => {getHosts()}, []);

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
                    <button title="Bloquer" onClick={handleBlockButtonClick}><LuTrash2/></button>
                    <button title="Actualiser" onClick={getHosts}><LuRepeat2/></button>
                </div>
            </div>
            <div className="box">
                <div className="tablebox">
                    <h3>List of blocked hosts</h3>
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
                                    <th className="checkcase"></th>
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

export default Hosts;
