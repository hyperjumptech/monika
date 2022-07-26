---
id: cli-options
title: Command-line Options
---

Monika can be run with the single command `monika` typed into the command shell. However to fully enjoy its flexibility, there are several options and arguments that can be used.

The common `-h` or `--help` displays all available options

```bash
monika -h
```

## Configuration

Monika by default will look for the `monika.yml` config file.
You may want to store different configurations for different environments or projects. Applying custom configurations is straightforward by using the `-c` or `--config` flag followed by the filename.

```bash
monika --config staging-set.yml
```

A neat feature is that the configuration file is watched and any changes will cause Monika to reload.

You can also use a configuration from some remote resource, which you specify using the same `-c` flag and a URI address.

```bash
monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml
```

For remote configuration files, you can additionally specify how often (in seconds) Monika checks for changes with the `--config-interval` switch like this:

```bash
monika -c https://raw.githubusercontent.com/hyperjumptech/monika/main/config_sample/config.desktop.example.yml --config-interval 10
```

By default, monika will check remote locations once every 15 minutes.

### Multiple configurations

Monika also supports multiple sources of configuration at the same time.
**Any top-level** keys from the first argument will be overridden by the later source(s).

For example, assuming you have a file named `only-notif.yml` whose content `{"notifications":[<your-notifications-here>]}`

```bash
# only-notif.yml's notifications will override notifications foo-monitoring.yml has
monika -c foo-monitoring.yml only-notif.yml
```

## Auto-update

Monika supports automatic update with `--auto-update major|minor|patch`. Where `major|minor|patch` refers to [semantic versioning (semver) specification](https://semver.org/). By default, the updater will check for a new Monika version every 24 hours.

```bash
monika --auto-update patch
```

**Note that** auto-update will make Monika terminate itself after successful update. To automatically restart Monika when terminated, you need to run Monika with a process manager application, e.g., monit, pm2, nodemon.

## Create Config

Just starting out? Want to make a new configuration? Running `monika` without any parameters (and without any default config found in the working directory) will pull a default configuration `monika.yml` as a starting point. Looking for more options? The `--create-config` flag will spin up an easy Web based configuration file generator.

```bash
monika --create-config
```

As an alternative, the generator is able to read HAR or postman files as input to convert into monika.yml configuration files.

Use the `--har` or the `--postman` in combination with `--create-config` on the command line to convert those files.

```bash
monika --create-config --har myfile.har
```

The above example creates a config file from an existing HAR archive. Auto generated files defaults to 'monika.yml'. Use the `-o` output flag to specify another name.

```bash
monika --create-config --postman mypostman.json -o new-monika.yml
```

When generating config files, if an existing `monika.yml` already exists, the user will be prompted before overwriting. To bypass the user prompt, use the `--force` flag.

## Force

The `--force` flag forces the execution of a command. The force flag will bypass any user prompts with an affirmative. If a Yes/No prompt is normally presented, `--force` will bypass the prompt and assume a Yes.

```bash
monika --flush --force
```

The example above flushes the database without waiting for user confirmation.

## HAR

Monika supports HAR files as input. HAR are JSON formatted HTTP ARchive files. Follow [these steps](https://medium.com/hyperjump-tech/generate-your-monika-configuration-using-http-archive-har-764944cbb9e6) to generate your own HAR file from the site you've visited then use Monika to refetch the pages and ensure they still work.

You use the `-H` or `--har` to specify a HAR file.

```bash
monika -H my-file.har
```

### Create config from HAR file

You can use the combination of `--create-config` and `--har` flags to convert the HAR archive into a `monika.yml` configuration file.

```bash
# default to monika.yml
monika --create-config -H my-file.har
```

### Merge HAR file to existing configurations

You can also use `-c/--config` to merge properties with them. Note that using `--har` will override probes passed to `-c/--config`.

```bash
monika --config monika-notifications.yml -H my-file.har
```

**P.S.**: HAR files may contain sensitive information, use caution when distributing HAR filles.

## Id

By default Monika loops through all the probe configurations in the order they are entered. However, you can specify any run order you want using the `-i` or `--id` flags.

```bash
monika -i 1,3,1,2,4,5,7,7
```

The above example will run probe id 1, 3, 1, 2, 4, 5, 7, 7 in that order just once. All id must be valid ids on the configuration file. You can combine the `--id` flag with the `-r` repeat flag to continuously repeat the specific ids.

## Logging

Monika stores requests and responses data in an internal log file. By default, it only stores data when an incident or recovery occurs. You may choose to store all requests using the `--keep-verbose-logs` flag.

```bash
monika --keep-verbose-logs
```

To dump (display) all the logs, use the `-l` or `--logs` flag.

```bash
monika --logs
```

You can flush the log history with the `--flush` option. there is no `-f` short flag for this command.

```bash
monika --flush
```

You must respond with a capital `"Y"` to confirm if you want to flush the logs or use the `--force` flag to force a Yes without prompting.

## Postman

> NOTE: We only support Postman collection v2.0 and v2.1 files.

Have an existing request on postman you want to automate? Monika supports reading postman.yml as configuration input. Use the `-p` or the `--postman` switches.

```bash
monika -p postman.json
```

### Create config from Postman file

You can use the combination of `--create-config` and `--postman` flags to convert the postman files to a monika.yml config file.

```bash
monika --create-config --postman postman.json
```

### Merge Postman file to existing configurations

You can also use `-c/--config` to merge properties with them. Note that using `--postman` will override probes passed to `-c/--config`.

```bash
monika --config monika-notifications.yml --postman my-postman-collection.json
```

## Insomnia

Use your own [Insomnia](https://insomnia.rest) collection with Monika by providing `--insomnia` or `-I`. We currently only support Insomnia **export version 4**. You can use both JSON and YAML file format.

```bash
monika -I /your/insomnia/collection.yaml # JSON / YAML
```

### Create config from Insomnia file

Generate your Monika configuration by combining `--create-config` and `--insomnia` flags to convert your Insomnia collection file to a monika config file.

```bash
monika --create-config --insomnia /your/insomnia/collection.yaml # JSON / YAML
```

### Merge Insomnia file to existing configurations

Merge your existing configurations with an Insomnia collection file using `-c/--config` together with `-I/--insomnia`. Note that this will override probes passed to `-c`.

```bash
monika --config monika-notifications.yml --insomnia /insomnia/collection.yml
```

## Sitemap

Monika supports reading sitemap.xml as configuration input. Use the `--sitemap` switches.

```bash
monika --sitemap sitemap.xml
```

### Create config from Sitemap file

You can use the combination of `--create-config` and `--sitemap` flags to convert the sitemap xml file to a monika.yml config file.

```bash
monika --create-config --sitemap sitemap.xml
```

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
| `monika_alert_total`                   | Counter   | Collect total alert triggered                | `id`, `name`, `url`, `method`, `alertQuery` |

## Repeat

By default monika will continuously loop through all your probes in the configuration. To loop for a specific number of repeats use the `-r` or `--repeat` flags followed by a number. For example to repeat only 3 times type the command below:

```bash
monika -r 3
```

You can combine this flag with the `--id` flag to repeat custom sequences.

```bash
monika -r 3 -i 1,3,1
```

## Follow Redirects

By default Monika will follow redirects once. You can set the value of `--follow-redirects` flag to tell Monika to follow redirects as many as you want. If you don't want to follow redirects, set the value to zero.

```bash
monika --follow-redirects 0 # disable following redirects
```

## STUN

By default monika will continuously check the [STUN](https://en.wikipedia.org/wiki/STUN) server in 20 second intervals. You can specify the number of intervals using the `-s` or `--stun` flags followed by a number in seconds. For example to set the interval to 10 seconds type the command below:

```bash
monika -s 10
```

If the number is zero or less, monika will check the STUN server just once, not repeatedly, to get public IP.

## Summary

While Monika is running, you can fetch the running statistics by using the `--summary` flag from another terminal.

```bash
monika --summary
```

Please note that you need to run the above command from the same working directory as the running monika you want to see/check.
The '--summary' flag also does not when no other monika process is running.

## Verbose

Like your app to be more chatty and honest revealing all its internal details? Use the `--verbose` flag.

```bash
monika --verbose
```

## Version

The `-v` or `--version` flag prints the current application version.

```bash
monika -v
```
