FROM python:2.7.9-onbuild
WORKDIR /usr/src/app/backend

EXPOSE 8080

CMD [ "python", "./server.py" ]
