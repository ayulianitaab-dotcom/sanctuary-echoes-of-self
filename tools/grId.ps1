# Draws a labelled 50px grid over a sheet so crop coordinates can be measured.
param(
  [string]$Sheet = "main",
  [int]$X0 = 0, [int]$Y0 = 0, [int]$W = 0, [int]$H = 0,
  [string]$Out = ".tmp-crops/cal.png"
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sheets = @{
  main   = Join-Path $root ".cloud-attachments/248b579abc2fa3a001870f6528348c3cb4d032c744e58a4187dfa882b7b200c7.webp"
  lineup = Join-Path $root ".cloud-attachments/cf45f3d4d0e8988e2626be2d110d71407e635f191bacbc6d4663aa6fb959d445.webp"
  style  = Join-Path $root ".cloud-attachments/f39988447a762e09b82cd97ca2ab3b21a49ba70c16cc33ff5e4a15c4dfc41683.webp"
}
$path = $sheets[$Sheet]
$stream = [System.IO.File]::OpenRead($path)
$decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($stream, "None", "OnLoad")
$frame = $decoder.Frames[0]
$stream.Close()

$pw = [int]$frame.PixelWidth; $ph = [int]$frame.PixelHeight
if ($W -le 0) { $W = $pw }; if ($H -le 0) { $H = $ph }

$rect = New-Object System.Windows.Int32Rect($X0, $Y0, $W, $H)
$crop = New-Object System.Windows.Media.Imaging.CroppedBitmap($frame, $rect)
$enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($crop))
$tmpPng = Join-Path $root ".tmp-crops/_cal_raw.png"
$fs = [System.IO.File]::Create($tmpPng); $enc.Save($fs); $fs.Close()

$bmp = [System.Drawing.Bitmap]::FromFile($tmpPng)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$font = New-Object System.Drawing.Font("Consolas", 9)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 255, 0, 128), 1)
for ($gx = 0; $gx -le $W; $gx += 50) {
  $g.DrawLine($pen, $gx, 0, $gx, $H)
  if ($gx % 100 -eq 0) {
    $abs = $X0 + $gx
    $g.DrawString("$abs", $font, [System.Drawing.Brushes]::Magenta, ($gx + 1), 1)
    $g.DrawString("$abs", $font, [System.Drawing.Brushes]::Magenta, ($gx + 1), ($H - 14))
  }
}
for ($gy = 0; $gy -le $H; $gy += 50) {
  $g.DrawLine($pen, 0, $gy, $W, $gy)
  if ($gy % 100 -eq 0) {
    $abs = $Y0 + $gy
    $g.DrawString("$abs", $font, [System.Drawing.Brushes]::Cyan, 2, ($gy + 1))
    $g.DrawString("$abs", $font, [System.Drawing.Brushes]::Cyan, ($W - 42), ($gy + 1))
  }
}
$g.Dispose()

$maxW = 1100
$scale = [math]::Min(1.0, $maxW / $bmp.Width)
$ow = [int]($bmp.Width * $scale); $oh = [int]($bmp.Height * $scale)
$outBmp = New-Object System.Drawing.Bitmap($ow, $oh)
$g2 = [System.Drawing.Graphics]::FromImage($outBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($bmp, 0, 0, $ow, $oh)
$g2.Dispose()
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]82)
$outPath = Join-Path $root $Out
$outBmp.Save($outPath, $codec, $ep)
$outBmp.Dispose(); $bmp.Dispose()
Remove-Item $tmpPng -Force
Write-Output ("calibration -> " + $Out + " (" + $ow + "x" + $oh + ")")
