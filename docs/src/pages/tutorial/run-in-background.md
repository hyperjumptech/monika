---
id: run-in-background
title: Run Monika in Background
---

By default Monika will run in the foreground. Like other Node.js applications, there are several ways to run Monika in the background on Unix, Linux, and macOS.

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
