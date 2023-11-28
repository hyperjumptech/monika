function setup() {
    load './node_modules/bats-support/load.bash'
    load './node_modules/bats-assert/load.bash'
}

@test "Should be able to check version" {
    run npm start -- -v

    assert_success
    assert_output --partial '@hyperjumptech/monika'
}

@test "Should be able to print help" {
    run npm start -- -h

    assert_success
    assert_output --partial 'Monika command line monitoring tool'
    assert_output --partial 'USAGE'
    assert_output --partial 'FLAGS'
    assert_output --partial 'DESCRIPTION'
    assert_output --partial 'EXAMPLES'
}

@test "Should failed with missing configuration" {
    run npm start -- -c ./not-found.yml

    assert_failure
    assert_output --partial 'CLIError: Configuration file not found: ./not-found.yml.'
}

@test "Should success starting monika" {
    run npm start -- -r 1 -s 0 -c test/bats/configs/basic.yml

    assert_success
    assert_output --partial 'Starting Monika.'
}

@test "Should success starting monika with warnings" {
    run npm start -- -r 1 -s 0 -c test/bats/configs/basic_warnings.yml

    assert_success
    assert_output --partial 'Warning: Probe 1 has no name defined'
    assert_output --partial 'Warning: Probe 1 has no Alerts configuration defined'
}

@test "Should be able to run probe" {
    run npm start -- -r 1 -s 0 -c test/bats/configs/basic.yml

    assert_success
    assert_output --partial 'GET https://symon.hyperjump.tech'
}

@test "Should be able to create config file from har" {
    run npm start -- --create-config --har test/testConfigs/harTest.har --output test/bats/configs/harTest.yml
    run cat test/bats/configs/harTest.yml
    run rm test/bats/configs/harTest.yml

    assert_success
}

@test "Should be able to create config file from postman collection" {
    run npm start -- --create-config --postman test/testConfigs/simple.postman_collection.json --output test/bats/configs/postman_collection.yml
    run cat test/bats/configs/postman_collection.yml
    run rm test/bats/configs/postman_collection.yml

    assert_success
}

@test "Should be able to run monika using har file" {
    run npm start -- -r 1 -s 0 --har test/testConfigs/harTest.har

    assert_success
    assert_output --partial 'GET https://yt3.ggpht.com/a/default-user=s68'
}

@test "Should be able to run monika using postman collections" {
    run npm start -- -r 1 -s 0 --postman test/testConfigs/simple.postman_collection.json

    assert_success
    assert_output --partial 'GET http://127.0.0.1:5000/v1'
}
