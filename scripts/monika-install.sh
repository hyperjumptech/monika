#!/bin/bash

echo ''
echo '███╗   ███╗ ██████╗ ███╗   ██╗██╗██╗  ██╗ █████╗ '
echo '████╗ ████║██╔═══██╗████╗  ██║██║██║ ██╔╝██╔══██╗'
echo '██╔████╔██║██║   ██║██╔██╗ ██║██║█████╔╝ ███████║'
echo '██║╚██╔╝██║██║   ██║██║╚██╗██║██║██╔═██╗ ██╔══██║'
echo '██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║██║  ██╗██║  ██║'
echo '╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝'
echo ''

# main repo url
repo_url="https://github.com/hyperjumptech/monika/"

# default install version
version_to_install="latest"

# default monika path
install_dir="${MONIKA_HOME:-"$HOME/.monika"}"

binary_url() {
  local version_name="$1"
  local os="$2"
  echo "$repo_url\releases/download/v$version_name/monika-v$version_name-$os-x64.zip"
}

info() {
  local action="$1"
  local details="$2"
  command printf '\033[1;32m%12s\033[0m %s\n' "$action" "$details" 1>&2
}

error() {
  command printf '\033[1;31mError\033[0m: %s\n\n' "$1" 1>&2
}

warning() {
  command printf '\033[1;33mWarning\033[0m: %s\n\n' "$1" 1>&2
}

# sanity checks

info "Looking for unzip..."
if ! command -v unzip > /dev/null; then
	error "Please install unzip on your system using your favourite package manager."
	exit 1
fi

info "Looking for curl..."
if ! command -v curl > /dev/null; then
	error "Please install curl on your system using your favourite package manager."
	exit 1
fi

help_page() {
  cat >&2 <<END_HELP
monika-install: Installer for Monika

USAGE:
  monika-install [..FLAGS] [...OPTIONS]
FLAGS (Optional):
  -h, --help    Print this help
  -v, --version Install specific version of Monika
END_HELP
}

sanitize_version() {
  echo "$1" | grep -oP '([0-9]+(\.[0-9]+)+)'
}

get_latest_version() {
  local url="$repo_url\releases/latest"
  echo "$url"
  sanitize_version "$(curl -iLs -o /dev/null -w %{url_effective} https://github.com/hyperjumptech/monika/releases/latest)"
}

get_os_name() {
  local os=$(uname -s)
  case "$os" in
    Darwin)
      echo "macos"
      return 0
      ;;
    Linux)
      echo "linux"
      return 0
      ;;
    *)
      error "Unsupported OS: $os"
      exit 1
      ;;
  esac
}

install_release_version() {
  local os=$(get_os_name)
  local version_name="$1"
  echo $(binary_url "$version_name" "$os")
}

# check for issue with MONIKA_HOME
# if it is set, and exists, but is not a directory, the install will fail
monika_home_is_ok() {
  if [ -n "${MONIKA_HOME-}" ] && [ -e "$MONIKA_HOME" ] && ! [ -d "$MONIKA_HOME" ]; then
    error "\$MONIKA_HOME is set but is not a directory ($MONIKA_HOME)."
    eprintf "Please check your profile scripts and environment."
    return 1
  fi
  return 0
}

install_version() {
  local version_to_install="$1"
  if ! monika_home_is_ok; then
    exit 1
  fi

  case "$version_to_install" in
    latest)
      local latest_version="$(get_latest_version)"
      info "Installing latest version of Monika ($latest_version)"
      install_release_version "$latest_version"
      ;;
    *) # assume anything else is monika version
      local version_name=$(sanitize_version "$version_to_install")
      info "Installing Monika version $version_name"
      install_release_version "$version_name"
      ;;
  esac
}

check_architecture() {
  local arch="$(uname -m)"
  if [[ $arch = "x86_64" ]]; then
    return 0
  fi

  if [[ $arch = "arm64" ]] && [[ "$(uname -s)" = "Darwin" ]]; then
    return 0
  fi

  error "Sorry! Monika currently only provides pre-built binaries for x86_64 architectures."
  return 1
}

while [ $# -gt 0 ]
do
  arg="$1"
  case "$arg" in
    -h|--help)
      help_page
      exit 0
      ;;
    -v|--version)
      shift # shift off the argument
      version_to_install="$1"
      shift # shift off the value
      ;;
  esac
done

check_architecture

install_version "$version_to_install" "$install_dir"
