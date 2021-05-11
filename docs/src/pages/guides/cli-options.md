# Command Line Options

Monika can be run with the single command `monika` typed into the command shell. However to fully enjoy its flexibility, there are several options and arguments that can be used.

The common `-h` or `--help` displays all available options

```bash
monika -h
```

## Configuration

Monika by default will look for the `monika.json` config file.
You may want to store different configurations for different environments or projects. This is straight forward by using the `-c` or `--config` flag followed by the filename.

```bash
monika --config staging-set.json
```

## Create Config

Just starting out? Want to make a new configuration? The `--create-config` flag will spin up a configuration file generator

```bash
monika --create-config
```

## Id

By default Monika loops through all the probe configuration in order they are entered. However, you can specify any run order you want using the `-i` or `--id` flags.

```bash
monika -i 1,3,1,2,4,5,7,7
```

The above example will run probe id 1, 3, 1, 2, 4, 5, 7, 7 in that order. All id must be valid ids on the configuration file.

## Logging

All command and responses are stored in an internal log file. You can dump (display) all the logs using the `-l` or `--logs` flag.

```bash
monika --logs
```

You can flush the log history with the flush option. there is no `-f` short flag for this command.

```bash
monika --flush
```

You must respond with a capital `"Y"` to confirm if you want to flush the logs.

## Repeat

By default monika will continuosuly loop through all your probes in the configuration. You can specify the number of repeats using `-r` or `--repeat` flags followed by a number. For example to repeat only 3 times type the command below:

```bash
monika -r 3
```

You can combine this flag with the `--id` flag to repeat custom sequences.

```bash
monika -r 3 -i 1,3,1
```

## Verbose

Like your app to be more chatty and honest revealing all its internal details? Use the `--verbose` flag.

```bash
monika --verbose
```

## Version

The `-v` or `--version` flag prints current application version.

```bash
monika -v
```
