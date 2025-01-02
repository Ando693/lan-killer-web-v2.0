import React, { useState, useEffect } from "react";
import { LuTrash2, LuRepeat2 } from "react-icons/lu";
import { Progress, Error } from "./utils";
import { LuXSquare } from "react-icons/lu";

type Data = {
    ip: string,
    mac: string,
    vendor: string
}

type Trash = {
    id: number,
    mac: string
}

const API = "http://localhost:5000/";

const Blacklist: React.FC = () => {
    const [tabledata, setTableData] = useState<Data[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchValue, setSearchValue] = useState<string>('');

    const getHosts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/getblacklist`);
            const data: Data[] = await response.json();
            setTableData(data);
        } catch (err: any) {
            console.log(err);
            setError(err.toString());
        }
        setLoading(false);
    };

    const remove = async (hosts:Trash) => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/blremove`, {
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
                    <button title="Actualiser" onClick={getHosts}><LuRepeat2/></button>
                </div>
            </div>
            <div className="box">
                <div className="tablebox">
                    <h3>Firewall Blacklist</h3>
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
                                    <th>IP Address</th>
                                    <th>MAC Address</th>
                                    <th>MAC Vendor</th>
                                    <th className="checkcase"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((e, index) => (
                                    <tr key={index}>
                                        <td>{e.ip}</td>
                                        <td>{e.mac}</td>
                                        <td>{e.vendor}</td>
                                        <td>
                                            <button title="Bloquer" className="delete" onClick={() => remove({id: index + 1, mac: e.mac})}>
                                                <LuTrash2/>
                                            </button>
                                        </td>
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

export default Blacklist;
