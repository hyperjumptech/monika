function setup() {
    load './node_modules/bats-support/load.bash'
    load './node_modules/bats-assert/load.bash'
}

@test "Should failed of missing configuration" {
    run npm start
    
    assert_failure 
    assert_output --partial 'Error: Configuration file not found.'
}

@test "Should failed and check version" {
    run npm start
    
    assert_failure 
    assert_output --partial '@hyperjumptech/monika@1.6.5'
}
