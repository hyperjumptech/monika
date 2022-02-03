#!/bin/sh
# Shell script to automatically install Monika. This script should be compatible across shells, e.g., zsh, bash, dash.
# For compatibility check and linting, use "checkbashisms -p monika-install.sh" and https://www.shellcheck.net/

echo ""
echo "███╗   ███╗ ██████╗ ███╗   ██╗██╗██╗  ██╗ █████╗ "
echo "████╗ ████║██╔═══██╗████╗  ██║██║██║ ██╔╝██╔══██╗"
echo "██╔████╔██║██║   ██║██╔██╗ ██║██║█████╔╝ ███████║"
echo "██║╚██╔╝██║██║   ██║██║╚██╗██║██║██╔═██╗ ██╔══██║"
echo "██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║██║  ██╗██║  ██║"
echo "╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""

# main repo url
repo_url="https://github.com/hyperjumptech/monika/"

# default install version
version_to_install="latest"

# default monika path
install_dir=$HOME"/.monika"

os="linux"
if [ "$(uname -s)" = "Darwin" ]; then
  os="macos"
fi

binary_url() {
  version_name="$1"
  os="$2"
  echo $repo_url"releases/download/v$version_name/monika-v$version_name-$os-x64.zip"
}

info() {
  action="$1"
  details="$2"
  command printf "\033[1;32m%12s\033[0m %s\n" "$action" "$details" 1>&2
}

error() {
  command printf "\033[1;31mError\033[0m: %s\n\n" "$1" 1>&2
}

warning() {
  command printf "\033[1;33mWarning\033[0m: %s\n\n" "$1" 1>&2
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
  echo "$1" | grep -Eo "([0-9]+(\.[0-9]+)+)"
}

get_latest_version() {
  url=$repo_url"releases/latest"
  echo "$(sanitize_version $(curl -iLs -o /dev/null -w %{url_effective} $url))"
}

install_from_file() {
  unzip -o "$1" -d "$install_dir"
  chmod +x "$install_dir/monika"
  rm "$1"
}

install_release_version() {
  version_name="$1"
  url=$(binary_url "$version_name" "$os")
  target_path="$install_dir/monika-v$version_name-$os-x64.zip"
  if [ ! -d "$install_dir" ]; then
    mkdir "$install_dir"
  fi
  
  if [ ! -f "$target_path" ]; then
    info "Downloading from: $url"
    # download and overwrite target path
    curl -L "$url" > "$target_path"
  fi
  install_from_file "$target_path"
}

monika_home_is_ok() {
  if [ -f "$install_dir" ]; then
    error "$install_dir is a file. Please remove it first before installation."
    return 1
  fi
  return 0
}

install_version() {
  version_to_install="$1"
  if ! monika_home_is_ok; then
    exit 1
  fi
  case "$version_to_install" in
    latest)
      latest_version="$(get_latest_version)"
      info "Installing latest version of Monika ($latest_version)"
      install_release_version "$latest_version" "$install_dir"
      ;;
    *) # assume anything else is monika version
      version_name=$(sanitize_version "$version_to_install")
      info "Installing Monika version $version_name"
      install_release_version "$version_name" "$install_dir"
      ;;
  esac
}

check_architecture() {
  arch="$(uname -m)"
  if [ "$arch" = "x86_64" ]; then
    return 0
  fi

  if [ "$arch" = "arm64" ] && [ "$(uname -s)" = "Darwin" ]; then
    return 0
  fi

  error "Sorry! Monika currently only provides pre-built binaries for x86_64 architectures."
  exit 1
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

info "Monika is now installed on $install_dir, you can start using monika directly from this session."
info "To make it permanently recognized across sessions, you can put \"export PATH=\$PATH:$install_dir\" (without double quotes) into your shell startup."
info "E.g., ~/.profile, ~/.zshrc, ~/.bashrc."
