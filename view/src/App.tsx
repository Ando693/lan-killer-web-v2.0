import { useState } from "react"
import Sidebar from "./components/sidebar"
import { Monitoring, Hosts, Blacklist, About } from "./pages"

const App = () => {

    const [etat, setEtat] = useState<number>(1)

    return (
        <div className="app">
            <Sidebar action={(e:number) => setEtat(e)}/>
            <div className="home">
                {
                    etat == 1? <Monitoring/>:
                    etat == 2? <Hosts/>:
                    etat == 3? <Blacklist/>:
                    etat == 4? <About/>:null
                }
            </div>
        </div>
    )

}

export default App
