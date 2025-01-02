from configparser import ConfigParser
from flask import Flask, request, jsonify, g, render_template, send_from_directory
from flask_cors import CORS
from kthread import KThread
from lib import Firewall, Targetone, scan, getmactable, getipbymac, removerule, stop_revenge, Blockall
from mac_vendor_lookup import MacLookup
from plyer import notification
import sqlite3
import time

app = Flask(__name__, template_folder='static')
CORS(app)

config = ConfigParser()
config.read("config.ini")

DB = 'host.db'
BROADCAST = False
blockedhosts = {}
broadcast_thread = None


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


def start_broadcast():

    def start():
        notify('Broadcast attack started !')
        while True:
            Blockall.start()
            time.sleep(0.2)

    global BROADCAST
    global broadcast_thread
    thread = KThread(target=start, daemon=True)
    thread.start()
    broadcast_thread = thread
    BROADCAST = True


def stop_broadcast():

    global BROADCAST
    BROADCAST = False
    broadcast_thread.terminate()
    Blockall.stop()
    notify('Broadcast attack stopped !')


def get_db():
    
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB)
    return db


def queryDB(query):

    cursor = get_db().execute(query)
    result = cursor.fetchall()
    cursor.close
    return result


def start_targetone(ip, mac):
    
    while True:
        Targetone.add(ip, mac)
        print(f'targetone started at {ip}')
        time.sleep(0.5)


@app.get('/')
def main():

    template = "index.html"
    return render_template(template)


@app.get('/assets/<path:filename>')
def template_assets(filename):

    return send_from_directory('static/assets', filename)


@app.get('/hosts')
def gethosts():

    hosts = []
    result = scan()
    for host in result:
        query = "SELECT mac FROM blockedhosts WHERE mac = '{}'".format(host['mac'])
        response = queryDB(query)
        data = ''
        if response:
            data = response[0][0]
        if data != host['mac']:
            hosts.append(host)

    return jsonify(hosts)


@app.post('/block')
def block_hosts():

    data = request.get_json()

    for host in data:
        ip = host['ip']
        mac = host['mac']
        vendor = host['vendor']
        daemon = KThread(target=start_targetone, daemon=True, args=(ip, mac,))
        query = "INSERT INTO blockedhosts (ip, mac, vendor) VALUES ('{}', '{}', '{}')".format(ip, mac, vendor)
        if mac in blockedhosts:
            pass
        else:
            blockedhosts[mac] = daemon
            blockedhosts[mac].start()
            queryDB(query) 
            get_db().commit()

    return jsonify(True)


@app.post('/unblock')
def unblock_hosts():

    data = request.get_json()

    for host in data:
        ip = host['ip']
        mac = host['mac']
        blockedhosts[mac].terminate()
        del blockedhosts[mac]
        Targetone.remove(ip, mac)
        query = "DELETE FROM blockedhosts WHERE mac = '{}'".format(mac)
        queryDB(query)
        get_db().commit()

    return jsonify(True)


@app.get('/getblockedhosts')
def getblockedhosts():

    query = "SELECT * FROM blockedhosts"
    result = queryDB(query)

    blhosts = []
    for host in result:
        blhosts.append({'ip':host[0], 'mac':host[1], 'vendor':host[2]})

    return jsonify(blhosts)


@app.get('/getblacklist')
def getblacklist():

    trash = getmactable()
    result = []

    for mac in trash:
        try:
            ip = getipbymac(mac)
            if ip == False:
                ip = 'Unknown'
        except:
            ip = 'Unknown'
        try:
            vendor = MacLookup().lookup(mac)
        except:
            vendor = 'Unknown'
        result.append({'ip':ip, 'mac':mac, 'vendor':vendor})

    return jsonify(result)


@app.post('/blremove')
def remove_from_blacklist():

    data = request.get_json()
    numero = data.get('id')
    mac = data.get('mac')
    removerule(numero)
    stop_revenge(mac)

    return jsonify(True)


@app.get('/getBroadcast')
def getBroadcast():

    return jsonify(BROADCAST)


@app.post('/setBroadcast')
def setBroadcast():

    data = request.get_json()
    status = data.get('status')
    print(status)
    if status:
        start_broadcast()
    else:
        stop_broadcast()
    return jsonify(True)


def init_db():

    with app.app_context():
        query = "DELETE FROM blockedhosts"
        queryDB(query)
        get_db().commit()


if __name__ == '__main__':
    firewall = KThread(target=lambda:Firewall.start(), daemon=True)
    firewall.start()
    init_db()
    app.run(host='localhost', port=config['SERVER']['port'])

