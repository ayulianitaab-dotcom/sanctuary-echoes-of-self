# Finds the purple name plaques on the NPC lineup sheet so each card can be
# cropped around its true centre instead of a guessed grid.
param([string]$Out = "")
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root ".cloud-attachments/cf45f3d4d0e8988e2626be2d110d71407e635f191bacbc6d4663aa6fb959d445.webp"
$stream = [System.IO.File]::OpenRead($path)
$decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($stream, "None", "OnLoad")
$frame = $decoder.Frames[0]
$stream.Close()

$w = [int]$frame.PixelWidth; $h = [int]$frame.PixelHeight
$stride = $w * 4
$buf = New-Object byte[] ($stride * $h)
$frame.CopyPixels($buf, $stride, 0)

function Is-Plaque([int]$x, [int]$y) {
  $i = $y * $stride + $x * 4
  $b = $buf[$i]; $g = $buf[$i + 1]; $r = $buf[$i + 2]
  return (($b -gt 120) -and ($b -gt $r) -and ($r -gt $g) -and (($b - $g) -gt 35) -and ($r -lt 175))
}

function Plaque-Row([int]$y) {
  $count = 0
  for ($x = 0; $x -lt $w; $x++) { if (Is-Plaque $x $y) { $count++ } }
  return $count
}

$bestTop = @{ y = 0; n = 0 }
$bestBottom = @{ y = 0; n = 0 }
for ($y = 430; $y -lt 520; $y += 2) { $n = Plaque-Row $y; if ($n -gt $bestTop.n) { $bestTop = @{ y = $y; n = $n } } }
for ($y = 820; $y -lt 900; $y += 2) { $n = Plaque-Row $y; if ($n -gt $bestBottom.n) { $bestBottom = @{ y = $y; n = $n } } }
Write-Output ("top plaque row y=" + $bestTop.y + " purple=" + $bestTop.n)
Write-Output ("bottom plaque row y=" + $bestBottom.y + " purple=" + $bestBottom.n)

function Runs([int]$y) {
  $runs = @()
  $start = -1
  for ($x = 0; $x -lt $w; $x++) {
    if (Is-Plaque $x $y) {
      if ($start -lt 0) { $start = $x }
    } else {
      if ($start -ge 0 -and ($x - $start) -ge 40) { $runs += @{ a = $start; b = $x - 1; c = [int](($start + $x - 1) / 2) } }
      $start = -1
    }
  }
  if ($start -ge 0 -and ($w - $start) -ge 40) { $runs += @{ a = $start; b = $w - 1; c = [int](($start + $w - 1) / 2) } }
  return $runs
}

foreach ($band in @(@{ name = "TOP"; y = $bestTop.y }, @{ name = "BOTTOM"; y = $bestBottom.y })) {
  $runs = Runs $band.y
  Write-Output ($band.name + " runs=" + $runs.Count)
  foreach ($r in $runs) { Write-Output ("  x " + $r.a + ".." + $r.b + "  centre=" + $r.c) }
}
