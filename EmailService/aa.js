const { Client } = require("ssh2");

const conn = new Client();

conn
  .on("ready", () => {
    console.log("SSH connection ready");

    // Run the docker ps command on the remote server
    conn.shell((err, stream) => {
      if (err) throw err;

      stream
        .on("close", () => {
          console.log("SSH shell closed");
          conn.end();
        })
        .on("data", (data) => {
          const dataString = data.toString();
          const lines = dataString.trim().split("\n");

          lines.forEach((line) => {
            try {
              const container = JSON.parse(line);
              console.log(container);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          });
        });

      stream.end(
        "docker ps --format '{{json .}}' | grep \"0.0.0.0:3306->3306/tcp\"\nexit\n"
      );
    });
  })
  .connect({
    host: "your_remote_server_ip",
    port: 22,
    username: "your_username",
    password: "your_password",
  });
