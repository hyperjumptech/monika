---
id: run-in-background
title: Run Monika in Background
---

By default Monika will run in the foreground. Like other Node.js applications, there are several ways to run Monika in the background on Unix, Linux, and macOS.

### Using Docker

Refer to the [Run in Docker](https://monika.hyperjump.tech/tutorial/run-in-docker) documentation page.

### Using PM2

- Make sure you already have NPM installed
- Run `npm install -g pm2` to install PM2
- Run `pm2 start monika -- -c <your_full_path_to_the_monika.yml>` to start Monika using PM2

If you want to add more Monika parameters such as `--prometheus`, add it after the double dashes. But if you want to add more PM2 parameters such as `-i max`, add it before the double dashes.

Refer to the [PM2 Official Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/) for all available PM2 parameters.

### Using `nohup`

- On your terminal, run `nohup monika &`
- You'll get an output similar to the following.

  ```text
  [1] 93457
  appending output to nohup.out
  ```

  In the above example, 93457 is the process ID (pid). And the output of Monika is written to `nohup.out` file.

- To stop Monika, run `kill -9 <pid>`.

### Using `screen`

- On Debian/Ubuntu, you can install it by running `sudo apt install screen`.
- Run `screen`.
- Run `monika -c monika.yaml`
- Press Ctrl+a then D. This will cause Monika to run on a different screen in the background.
- To go back to the screen, run `screen -ls` to list the running screens. You will get an output similar to the following.

  ```text
  There is a screen on:
    9049.pts-0.the-server	(03/23/21 08:34:38)	(Detached)
    1 Socket in /run/screen/S-server.
  ```

  `9049.pts-0.the-server` is the name of the screen.

- Then run `screen -r <name_of_the_screen>`.
- To stop Monika, hit CTRL+C and then CTRL+D to exit/terminate Screen.

### Using `systemd`

- To use the systemd service unit, you need to locate the Monika binary. For example, if you installed Monika using NPM, run which monika to know where is your Monika located.
  e.g
  1. `/home/hyperjump/.nvm/versions/node/v14.17.6/bin/monika` is the full path to Monika binary file
  2. `/home/hyperjump/.nvm/versions/node/v14.17.6/bin/` is the full path to Monika binary directory
- Create a new file and copy the contents below into the file:

  ```
  [Unit]
  Description=Monika

  [Service]
  ExecStart=/bin/sh -c '<full_path_to_your_monika_binary_file> -c <full_path_to_your_monika.yml>'
  Restart=on-failure
  User=<your_user>
  Group=<your_group>
  WorkingDirectory=<full_path_to_your_monika_binary_directory>

  [Install]
  WantedBy=multi-user.target
  ```

- Replace the values to the correct values and save the file as `monika.service`
- Adjust the service file permissions to 644 by running `sudo chmod 644 monika.service`
- Copy the `monika.service` file to `/etc/systemd/system/` folder by running `sudo cp monika.service /etc/systemd/system/monika.service`
- Reload the daemon server by running `sudo systemctl daemon-reload`
- Start Monika service by running `sudo systemctl restart monika.service`
- To confirm that Monika is working flawlessly, run `sudo systemctl status monika.service` in your terminal.
