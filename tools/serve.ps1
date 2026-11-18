# Minimal static file server for previewing the game with its portrait assets.
# No external dependencies: uses System.Net.HttpListener.
param([int]$Port = 54932)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
Write-Output ("serving " + $root + " on http://127.0.0.1:" + $Port + "/")

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { break }
  try {
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $path = Join-Path $root $rel
    if (Test-Path -LiteralPath $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
  } catch {
    # a reload that cancels an in-flight response must not kill the server
    try { $ctx.Response.Abort() } catch { }
  }
}
