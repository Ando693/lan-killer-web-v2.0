from configparser import ConfigParser

config = ConfigParser()
config.read("config.ini")
TrapMAC = config['LIB']['trapmac']

print(TrapMAC)