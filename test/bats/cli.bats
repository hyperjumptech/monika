function setup() {
    load './node_modules/bats-support/load.bash'
    load './node_modules/bats-assert/load.bash'
}

@test "Should failed with missing configuration" {
    run npm start
    
    assert_failure 
    assert_output --partial 'Error: Configuration file not found.'
}

@test "Should failed but version is printed" {
    run npm start
    
    assert_failure 
    assert_output --partial '@hyperjumptech/monika@'
}

@test "Should success starting monika" {
    run npm start -- -r 1 -s 0 -c test/bats/namika.yml
    
    assert_success
    assert_output --partial 'Starting Monika.'
}

@test "Should success starting monika with warning" {
    run npm start -- -r 1 -s 0 -c test/bats/namika.yml
    
    assert_success    
    assert_output --partial 'Warning: Probe 1 has no incidentThreshold'
}