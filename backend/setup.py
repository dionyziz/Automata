import config
import os
import logging

backend_path = os.path.dirname(os.path.realpath(__file__))

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s',
                    filename=backend_path + '/../automata.log',
                    level=logging.DEBUG)

print("Installing Python requirements")
os.system("pip install -r " + backend_path + "/../requirements.txt")

import db
DB = db.Database(config.SQL.HOST, config.SQL.USERNAME,
                 config.SQL.PASSWORD, config.SQL.DATABASE)

print("\n\nConnected to database")

if DB.query("SHOW TABLES") != ():
    ans = raw_input("Do you want to delete the old tables? y/n\n")
    if ans == 'y' or ans == 'yes':
        print("Deleting old users and automata tables\n")
        DB.query("DROP TABLE users, automata;")
        logging.info("Setup deleted tables\n")

tables = open(backend_path + '/etc/automata.sql', 'r')
print("\nCreating new tables\n")
DB.query(tables.read())

print("Creating wsgi file")

with open(backend_path + '/server.wsgi', 'w') as server:
    server.write("""import os
import sys

path = "%s"
os.chdir(os.path.dirname(__file__))
sys.path = [path] + sys.path

from server import app

application = app
""" % (config.DEPLOY_PATH + '/backend'))

logging.info("Setup completed succesfully")
print("\nSetup completed succesfully")
