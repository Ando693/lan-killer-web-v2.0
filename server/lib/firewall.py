from scapy.all import Ether, ARP, sniff, conf, getmacbyip, srp, send
from .spoofing import Targetone, Blockall
from .network import getmyip, getipbymac
from .logger import Logger
from plyer import notification
from kthread import KThread
from configparser import ConfigParser
import os
import subprocess
import time

logpath = f"{os.getcwd()}/logs".format("utf-8")
logfile = os.path.join(logpath, "firewall.log")
logger = Logger(log_file=logfile, log_name="firewall")

config = ConfigParser()
config.read("./config.ini")
TrapMAC = config['LIB']['trapmac']
gateway = str(conf.route.route('0.0.0.0')[2])
config['LIB']['gateway'] = str(getmacbyip(gateway))

with open('config.ini', 'w') as configfile:
    config.write(configfile)

revenges = {}

def getrevenges():
    return revenges


def notify(message):
    try:
        notification.notify(
            title='Lan killer alert', 
            message=message, 
            app_name="Lan KIller"
        )
    except:
        print('Notification incopatible')
        print(f'Message : {message}')


def iamhere():

    myip = getmyip()
    gateway = str(conf.route.route("0.0.0.0")[2])
    Gmac = getmacbyip(gateway)
    gMyip = myip.split('.')
    network = '.'.join(gMyip[:3])
    range = f'{network}.0/24'
    Rpac = ARP(pdst=gateway, hwdst=Gmac, psrc=myip, op=2)
    Mpac = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=range)

    i = 0
    while i < 5:
        send(Rpac, verbose=0)
        send(Mpac, verbose=0)
        i = i + 1
                 

def getmactable():

    command = 'arptables -L --line-number'
    result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)

    lines = result.stdout.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    table = [line.split() for line in non_empty_lines]
    del table[0]
    table.pop()

    macs = []
    for elem in table:
        macs.append(elem[4])
    return macs


def addrule(mac):

    def add():
        rule = 'arptables -I INPUT --source-mac {} -j DROP'
        rule = rule.format(mac)
        subprocess.run(rule, shell=True)

    def start_revenge(mac):
        ip = getipbymac(mac)
        if not ip:
            notify(f'Target ip from {mac} not found ! \nRevenge will canceled ...')
            logger.warning(f'Target ip from {mac} not found! Revenge will canceled ...')
        else:
            notify(f'Revenge on {ip} \nat {mac} started !')
            logger.info(f'Revenge on {ip} at {mac} started !')
            while True:
                Targetone.add(ip, mac)
                time.sleep(0.5)

    table = getmactable()

    if not table:
        notify(f'Wrong packet detected! \nsource : {mac}')
        logger.warning(f"Wrong packet detected! source : {mac}")
        add()
        notify(f'{mac} added to the blacklist')
        logger.info(f'{mac} added to the blacklist')
        start_revenge(mac)

    for elem in table:
        if elem != mac:
            notify(f'Wrong packet detected! \nsource : {mac}')
            logger.warning(f"Wrong packet detected! source : {mac}")
            add()
            notify(f'{mac} added to the blacklist')
            logger.info(f'{mac} added to the blacklist')
            start_revenge(mac)


def removerule(numero):

    command = f'arptables -D INPUT {numero}'
    subprocess.run (
        command, 
        shell=True, 
        stdout=subprocess.DEVNULL, 
        stderr=subprocess.DEVNULL
    )
    notify(f'Rules no {numero} supprimé')


def stop_revenge(mac):

    if mac in revenges:
        revenges[mac].terminate()
        del revenges[mac]
        notify(f'Revenge on {mac} stopped!')
    else:
        notify(f'Revenge on {mac} not found!')


def packet_callback(packet):

    if packet.haslayer(ARP):
        srcmac = packet[ARP].hwsrc
        srcip = packet[ARP].psrc

        if srcip == gateway:
            if srcmac == TrapMAC:
                pass
            elif srcmac != config['LIB']['gateway']:
                daemon = KThread(target=addrule, daemon=True, args=(srcmac,))
                if srcmac in revenges:
                    pass
                else:
                    revenges[srcmac] = daemon
                    revenges[srcmac].start()
                    iamhere()


def main():

    Initrules = 'arptables-restore < rules.txt'
    antiTrap = 'arptables -A INPUT -j DROP'
    acceptGateway = 'arptables -I INPUT --source-mac {} -j ACCEPT'.format(config['LIB']['gateway'])
    subprocess.run(Initrules, stdout=subprocess.DEVNULL, shell=True)
    subprocess.run(antiTrap, stdout=subprocess.DEVNULL, shell=True)
    subprocess.run(acceptGateway, stdout=subprocess.DEVNULL, shell=True)
    print('\033[32m \n FIREWALL STARTED ! \033[0m \n')
    sniff(prn=packet_callback, store=0)


class Firewall():

    def __init__(self) -> None:
        pass

    def start():
        main()
