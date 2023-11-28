function setup() {
    load '../node_modules/bats-assert/load.bash'
}

@test "shows version" {
    run monika -v

    assert_success
    assert_output --partial '@hyperjumptech/monika'
}

@test "shows initializing file when no config" {
    run rm -rf monika.yml
    run monika -r 1

    assert_success
    assert_output --partial 'No Monika configuration available, initializing...'
    assert_output --partial 'monika.yml file has been created in this directory. You can change the URL to probe and other configurations in that monika.yml file.'
}

@test "shows starting message with valid json config" {
    run monika -r 1 -c ./monika.example.json

    assert_success
    assert_output --partial 'Starting Monika.'
}

@test "shows starting message with valid yaml config" {
    run monika -r 1 -c ./monika.example.yml

    assert_success
    assert_output --partial 'Starting Monika.'
}
