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
    assert_output --partial 'OPTIONS'
    assert_output --partial 'EXAMPLES'
}

@test "Should failed with missing configuration" {
    run npm start
    
    assert_failure 
    assert_output --partial 'Error: Configuration file not found.'
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
    assert_output --partial 'Warning: Probe 1 has no incidentThreshold configuration defined'
    assert_output --partial 'Warning: Probe 1 has no recoveryThreshold configuration defined'
    assert_output --partial 'Warning: Probe 1 has no Alerts configuration defined'
}

@test "Should run probe" {
    run npm start -- -r 1 -s 0 -c test/bats/configs/basic.yml
    
    assert_success    
    assert_output --partial 'GET https://symon.hyperjump.tech'
}
