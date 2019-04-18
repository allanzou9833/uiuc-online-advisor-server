FROM postgres:11
COPY classes.csv /data/classes.csv
ADD create.sql /docker-entrypoint-initdb.d
ADD insert.sql /docker-entrypoint-initdb.d
EXPOSE 5432