FROM hayd/deno:latest

EXPOSE 3000

WORKDIR /app

ADD . /app

RUN deno cache app.ts

CMD ["run", "--allow-env", "--allow-read", "--allow-write", "--allow-net", "--allow-plugin", "--unstable", "app.ts"]

# sudo docker stop stopserver
# sudo docker build -t stopimage . --rm
# sudo docker run -p 3000:3000 -t --rm --name stopserver -d -it stopimage