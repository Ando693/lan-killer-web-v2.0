import logging

class Logger(object):

    def __init__(self, log_name, log_file):

        self.logger = logging.getLogger(log_name)
        handler = logging.FileHandler(log_file)
        
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)

        self.logger.addHandler(handler)
        self.logger.setLevel(logging.DEBUG)

    def info(self, msg):
        self.logger.info(msg)

    def debug(self, msg):
        self.logger.debug(msg)


    def warning(self, msg):
        self.logger.warning(msg)

  
    def error(self, msg):
        self.logger.error(msg)

    
    def exception(self, msg):
        self.logger.exception(msg)
