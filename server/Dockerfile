FROM hayd/deno:latest

EXPOSE 3000

WORKDIR /app

ADD . /app

RUN deno cache app.ts

CMD ["run", "--allow-env", "--allow-read", "--allow-write", "--allow-net", "--allow-plugin", "--unstable", "app.ts"]