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

Just starting out? Want to make a new configuration? The `--create-config` flag will spin up an easy Web based configuration file generator.

```bash
monika --create-config
```

As an alternative, configuration generator is able to read HAR or postman files as input to convert into monika.json configuration files.

Use the `--har` or the `--postman` in combination with `--create-config` on the command line to convert those files into a monika config.

```bash
monika --create-config --har myfile.har
```

The above examples creates a monika.json config file from an existing HAR file.
Use the `-o` output flag to specify the output file.

```bash
monika --create-config --postman mypostman.json -o new-monika.config
```

## HAR

Monika supports HAR files as input. HAR are JSON formatted HTTP ARchive file. Generate a HAR file from the site you've visited then use Monika to refetch the pages and ensure they still work.

You use the `-H` or `--har` to specify a HAR file.

```bash
monika -H my-file.har
```

You can use the combination of --create-config and --har switches to convert the HAR files to monika.config.

Please note, HAR files may contain sensitive information, use caution when distributing HAR filles.

## Id

By default Monika loops through all the probe configuration in order they are entered. However, you can specify any run order you want using the `-i` or `--id` flags.

```bash
monika -i 1,3,1,2,4,5,7,7
```

The above example will run probe id 1, 3, 1, 2, 4, 5, 7, 7 in that order just once. All id must be valid ids on the configuration file. You can combine the `--id` flag with the `-r` repeat flag to continuously repeat the specific ids.

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

## Postman

Have an existing request on postman you want to automate? Monika supports reading postman.json as configuration input. Use the `-p` or the `--postman` switches.

```bash
monika -p postman.json
```

You can use the combination of `--create-config` and `--postman` switches to convert the postman files to monika.config.

## Prometheus

You can expose the [Prometheus](https://prometheus.io/) metrics server with the `--prometheus` flag and server port as a value.

```bash
monika --prometheus 3001
```

Then you can scrape the metrics from `http://localhost:3001/metrics`.

### Available Metrics

Monika exposes [Prometheus default metrics](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors), [Node.js specific metrics](https://github.com/siimon/prom-client/tree/master/lib/metrics), and Monika probe metrics below.

| Metric Name                            | Type      | Purpose                                      | Label                                       |
| -------------------------------------- | --------- | -------------------------------------------- | ------------------------------------------- |
| `monika_probes_total`                  | Gauge     | Collect total probe                          | -                                           |
| `monika_request_status_code_info`      | Gauge     | Collect HTTP status code                     | `id`, `name`, `url`, `method`               |
| `monika_request_response_time_seconds` | Histogram | Collect duration of probe request in seconds | `id`, `name`, `url`, `method`, `statusCode` |
| `monika_request_response_size_bytes`   | Gauge     | Collect size of response size in bytes       | `id`, `name`, `url`, `method`, `statusCode` |

## Repeat

By default monika will continuously loop through all your probes in the configuration. You can specify the number of repeats using `-r` or `--repeat` flags followed by a number. For example to repeat only 3 times type the command below:

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
