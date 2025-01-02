from scapy.all import Ether, ARP, srp, conf
from mac_vendor_lookup import MacLookup
import psutil

def getmyip():
    gateway = str(conf.route.route("0.0.0.0")[2])
    gOctets = gateway.split('.')
    network = '.'.join(gOctets[:3])

    interfaces = psutil.net_if_addrs()
    for interface_name, addresses in interfaces.items():
        for address in addresses:
            if address.family == 2:
                myip = address.address
                gMyip = myip.split('.')
                mynetwork = '.'.join(gMyip[:3])
                if mynetwork == network:
                    return(myip)
                
                
def getipbymac(mac):

    gateway = str(conf.route.route("0.0.0.0")[2])
    gOctets = gateway.split('.')
    network = '.'.join(gOctets[:3])
    network = f'{network}.0/24'
    myip = getmyip()
    
    ans,unans = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=network),timeout=2, verbose=False)
    ips = [recv_packet[ARP].psrc for send_packet, recv_packet in ans]
    mcs = [recv_packet[ARP].hwsrc for send_packet, recv_packet in ans]

    for ip, mc in zip(ips, mcs):
        if mc == mac:
            return ip
    return False
                

def scan():
    
    gateway = str(conf.route.route("0.0.0.0")[2])
    gOctets = gateway.split('.')
    network = '.'.join(gOctets[:3])
    network = f'{network}.0/24'
    arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network)
    result = srp(arp_request, timeout=2, verbose=False)[0]
    
    devices = []
    myip = getmyip()
    for sent, received in result:
        try:
            vendor = MacLookup().lookup(received.hwsrc)
        except:
            vendor = 'Unknown'
        if myip == received.psrc:
            pass
        else:
            device = {'ip': received.psrc, 'mac': received.hwsrc, 'vendor' : vendor}
            devices.append(device)

    return devices