$ErrorActionPreference = 'Stop';
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64      = '_RELEASE_URL_'

$packageArgs = @{
  packageName   = 'monika'
  unzipLocation = $toolsDir
  url64bit      = $url64
  checksum64    = '_CHECKSUM_CONTENT_'
  checksumType64= 'sha256'
}

Install-ChocolateyZipPackage @packageArgs